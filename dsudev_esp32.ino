/*************************************************************
 Final Hackathon ESP32 Prototype
 - Laser + LDR flow sensing (velocity + rate)
 - Flow direction detection (A -> B / B -> A)
 - Relay-controlled pump and 2 solenoid valves
 - Automatic backflow prevention (valve shuts on reverse flow)
 - WiFi + HTTP POST to backend (/api/sensors)
 - Debounce, safety timeouts, non-blocking pump control
 - Configurable pins & behavior at the top
 *************************************************************/

#include <WiFi.h>
#include <HTTPClient.h>

// ---------------- CONFIG ----------------
// WiFi / Backend
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";
const char* SERVER_URL = "http://192.168.1.6:5000/api/sensors"; // replace with your backend

// Relay wiring logic: set true if your relay module is active-LOW (common for opto-relay boards)
const bool RELAY_ACTIVE_LOW = true;

// Pin mapping (change if needed)
const int RELAY_PUMP_PIN       = 26;  // Relay IN1 -> Pump
const int RELAY_VALVE_IN_PIN  = 27;  // Relay IN2 -> Inlet solenoid
const int RELAY_VALVE_OUT_PIN = 14;  // Relay IN3 -> Outlet solenoid
const int RELAY_SPARE_PIN     = 12;  // Relay IN4 spare

const int LASER1_PIN = 25; // Laser 1 (SIG)
const int LASER2_PIN = 33; // Laser 2 (SIG)

// LDR modules (digital or analog). If your LDR module has DO pin, use digitalRead.
const int LDR1_PIN = 34;   // LDR/digital out for laser1 beam
const int LDR2_PIN = 35;   // LDR/digital out for laser2 beam
// If you instead want analog LDR readings set USE_ANALOG_LDR = true and wire LDR AO to the pins above (ESP32 ADC)
const bool USE_ANALOG_LDR = false;
const int LDR1_ANALOG_PIN = 34; // AO pin (same numbers on ESP32)
const int LDR2_ANALOG_PIN = 35;
const int LDR_ANALOG_THRESHOLD = 2000; // adjust (0-4095), smaller = darker

// Water level sensor (optional)
const bool USE_WATER_LEVEL_SENSOR = true;
const int WATER_LEVEL_PIN = 32; // analog
const int WATER_LEVEL_EMPTY = 1500; // raw threshold adjust to your sensor

// Physical geometry (calibrate)
float distanceBetweenLDRs_cm = 10.0; // cm between the two beam sensors along pipe
float pipeDiameter_cm = 2.0;         // internal pipe diameter (cm)
float pipeArea_cm2 = 3.14159 * pow(pipeDiameter_cm / 2.0, 2.0); // cross-sectional area (cm^2)

// Timing & safety
const unsigned long DEBOUNCE_MS = 50;
const unsigned long FLOW_RESET_TIMEOUT_MS = 3000; // if second sensor not hit within this, reset
const unsigned long PUMP_MAX_RUN_MS = 60000; // safety max pump run (60s) per event
const unsigned long FLOW_EVENT_REPORT_MS = 2000; // min interval between HTTP posts (ms)

// ----------------- Derived / helper -----------------
const int RELAY_ON  = (RELAY_ACTIVE_LOW ? LOW : HIGH);
const int RELAY_OFF = (RELAY_ACTIVE_LOW ? HIGH : LOW);

// ----------------- State variables -----------------
volatile unsigned long firstTriggerMillis = 0;
volatile unsigned long secondTriggerMillis = 0;
volatile bool flowInProgress = false;
unsigned long lastFlowReset = 0;
unsigned long lastHttpPost = 0;

bool pumpState = false;
unsigned long pumpTurnedOnAt = 0;

// For simple software debounce
unsigned long lastLdr1Change = 0;
unsigned long lastLdr2Change = 0;
int lastLdr1Val = HIGH;
int lastLdr2Val = HIGH;

// ----------------- Forward declarations -----------------
void ensureWiFi();
void sendSensorDataToServer(const String& payload);
void startPump(unsigned long durationMs = PUMP_MAX_RUN_MS);
void stopPump();
void openInletValve();
void closeInletValve();
void openOutletValve();
void closeOutletValve();
int readLDR(int pin);
int readWaterLevelRaw();

// ----------------- Setup -----------------
void setup() {
  Serial.begin(115200);
  delay(100);

  // Relay pins
  pinMode(RELAY_PUMP_PIN, OUTPUT);
  pinMode(RELAY_VALVE_IN_PIN, OUTPUT);
  pinMode(RELAY_VALVE_OUT_PIN, OUTPUT);
  pinMode(RELAY_SPARE_PIN, OUTPUT);

  // Laser control pins
  pinMode(LASER1_PIN, OUTPUT);
  pinMode(LASER2_PIN, OUTPUT);

  // LDR pins
  if (USE_ANALOG_LDR) {
    // analog pins default input
  } else {
    pinMode(LDR1_PIN, INPUT);
    pinMode(LDR2_PIN, INPUT);
  }

  // Water level
  if (USE_WATER_LEVEL_SENSOR) {
    // analog read
  }

  // default: OFF relays
  digitalWrite(RELAY_PUMP_PIN, RELAY_OFF);
  digitalWrite(RELAY_VALVE_IN_PIN, RELAY_OFF);
  digitalWrite(RELAY_VALVE_OUT_PIN, RELAY_OFF);
  digitalWrite(RELAY_SPARE_PIN, RELAY_OFF);

  // Turn lasers ON (continuous) - if you prefer pulsed, change code to pulse around measurement
  digitalWrite(LASER1_PIN, HIGH);
  digitalWrite(LASER2_PIN, HIGH);

  Serial.println();
  Serial.println("=== Smart Flow Controller (Hackathon Final) ===");
  ensureWiFi();
  Serial.println("Ready. Monitoring beams...");
}

// ----------------- Main loop -----------------
void loop() {
  ensureWiFi();

  // Read LDRs (digital or analog threshold)
  int l1 = USE_ANALOG_LDR ? (analogRead(LDR1_ANALOG_PIN) < LDR_ANALOG_THRESHOLD ? LOW : HIGH) : digitalRead(LDR1_PIN);
  int l2 = USE_ANALOG_LDR ? (analogRead(LDR2_ANALOG_PIN) < LDR_ANALOG_THRESHOLD ? LOW : HIGH) : digitalRead(LDR2_PIN);

  unsigned long now = millis();

  // Debounce LDR1
  if (l1 != lastLdr1Val) {
    if (now - lastLdr1Change > DEBOUNCE_MS) {
      lastLdr1Val = l1;
      lastLdr1Change = now;
      if (l1 == LOW) { // beam interrupted => trigger
        Serial.println("[LDR1] Beam broken");
        // record start if not already
        if (!flowInProgress) {
          firstTriggerMillis = now;
          flowInProgress = true;
          lastFlowReset = now;
        }
      }
    }
  }

  // Debounce LDR2
  if (l2 != lastLdr2Val) {
    if (now - lastLdr2Change > DEBOUNCE_MS) {
      lastLdr2Val = l2;
      lastLdr2Change = now;
      if (l2 == LOW) { // beam interrupted => second trigger
        Serial.println("[LDR2] Beam broken");
        if (flowInProgress) {
          secondTriggerMillis = now;
          unsigned long timeDiff = 0;
          // compute direction using timestamps (start vs end)
          // We rely on order of triggers: if firstTriggerMillis < secondTriggerMillis -> A->B
          if (secondTriggerMillis >= firstTriggerMillis) {
            timeDiff = secondTriggerMillis - firstTriggerMillis;
          } else {
            // improbable but handle wrap / reverse case
            timeDiff = firstTriggerMillis - secondTriggerMillis;
          }

          if (timeDiff > 0 && timeDiff < FLOW_RESET_TIMEOUT_MS) {
            // compute
            float velocity_cm_per_s = distanceBetweenLDRs_cm / (timeDiff / 1000.0f); // cm/s
            float flowRate_cm3_per_s = velocity_cm_per_s * pipeArea_cm2;
            float flowRate_L_per_min = flowRate_cm3_per_s * 0.001f * 60.0f; // L/min

            String direction;
            bool forward = (firstTriggerMillis <= secondTriggerMillis);
            direction = forward ? "A->B" : "B->A";

            Serial.println("----- Flow Event -----");
            Serial.print("Direction: "); Serial.println(direction);
            Serial.print("Time diff (ms): "); Serial.println(timeDiff);
            Serial.print("Velocity (cm/s): "); Serial.println(velocity_cm_per_s);
            Serial.print("Flow (cm^3/s): "); Serial.println(flowRate_cm3_per_s);
            Serial.print("Flow (L/min): "); Serial.println(flowRate_L_per_min);
            Serial.println("----------------------");

            // action: forward -> allow & run pump; reverse -> prevent/backflow
            if (forward) {
              // open valves & run pump, but cap runtime
              openInletValve();
              openOutletValve();
              startPump(PUMP_MAX_RUN_MS);
            } else {
              // reverse flow detected -> close valves and stop pump
              preventBackflow(); // stops pump & closes valves
            }

            // read water level optionally
            int waterRaw = USE_WATER_LEVEL_SENSOR ? readWaterLevelRaw() : -1;

            // send JSON to backend (rate-limited)
            if (millis() - lastHttpPost > FLOW_EVENT_REPORT_MS) {
              String payload = "{";
              payload += "\"direction\":\"" + direction + "\"";
              payload += ",\"velocity_cm_s\":" + String(velocity_cm_per_s, 3);
              payload += ",\"flow_cm3_s\":" + String(flowRate_cm3_per_s, 3);
              payload += ",\"flow_L_min\":" + String(flowRate_L_per_min, 3);
              payload += ",\"waterRaw\":" + String(waterRaw);
              payload += ",\"pump\":" + String(pumpState ? 1 : 0);
              payload += ",\"time_ms\":" + String(now);
              payload += "}";
              sendSensorDataToServer(payload);
              lastHttpPost = millis();
            }
          } else {
            Serial.println("Ignored: timeDiff invalid or too large (no real event).");
          }

          // reset flow state
          flowInProgress = false;
          firstTriggerMillis = 0;
          secondTriggerMillis = 0;
          lastFlowReset = millis();
        } else {
          // LDR2 triggered but we had no LDR1 - treat as isolated; ignore or log
          Serial.println("[LDR2] Trigger with no LDR1 start - ignoring");
        }
      }
    }
  }

  // if flow started but timed out without second trigger, reset
  if (flowInProgress && (now - lastFlowReset > FLOW_RESET_TIMEOUT_MS)) {
    Serial.println("Flow start timed out - resetting state.");
    flowInProgress = false;
    firstTriggerMillis = 0;
  }

  // Pump safety: auto-stop if pump has been running too long
  if (pumpState && (millis() - pumpTurnedOnAt > PUMP_MAX_RUN_MS)) {
    Serial.println("Pump runtime exceeded safety max: forcing stop");
    stopPump();
  }

  // small loop delay to avoid busy spinning
  delay(20);
}

// ----------------- Functions -----------------

void ensureWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 10000) {
    delay(250);
    Serial.print(".");
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected: " + WiFi.localIP().toString());
  } else {
    Serial.println("\nWiFi not connected - will retry in background.");
  }
}

void sendSensorDataToServer(const String& payload) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Skipping POST - WiFi not connected");
    return;
  }

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  int httpResponseCode = http.POST(payload);
  if (httpResponseCode > 0) {
    Serial.print("HTTP POST response: ");
    Serial.println(httpResponseCode);
  } else {
    Serial.print("HTTP POST failed, error: ");
    Serial.println(httpResponseCode);
  }
  http.end();
}

void startPump(unsigned long durationMs) {
  if (pumpState) return; // already on
  digitalWrite(RELAY_PUMP_PIN, RELAY_ON);
  pumpState = true;
  pumpTurnedOnAt = millis();
  Serial.println("Pump STARTED");
  // We do not block here — pump will be auto-stopped by safety or manual call
}

void stopPump() {
  if (!pumpState) return;
  digitalWrite(RELAY_PUMP_PIN, RELAY_OFF);
  pumpState = false;
  pumpTurnedOnAt = 0;
  Serial.println("Pump STOPPED");
}

void openInletValve() {
  digitalWrite(RELAY_VALVE_IN_PIN, RELAY_ON);
  Serial.println("Inlet valve OPEN");
}
void closeInletValve() {
  digitalWrite(RELAY_VALVE_IN_PIN, RELAY_OFF);
  Serial.println("Inlet valve CLOSED");
}
void openOutletValve() {
  digitalWrite(RELAY_VALVE_OUT_PIN, RELAY_ON);
  Serial.println("Outlet valve OPEN");
}
void closeOutletValve() {
  digitalWrite(RELAY_VALVE_OUT_PIN, RELAY_OFF);
  Serial.println("Outlet valve CLOSED");
}

void preventBackflow() {
  // Close valves and stop pump immediately
  closeInletValve();
  closeOutletValve();
  stopPump();
  // Optional: send emergency message to backend
  String payload = "{";
  payload += "\"event\":\"backflow_detected\"";
  payload += ",\"time_ms\":" + String(millis());
  payload += "}";
  sendSensorDataToServer(payload);
  Serial.println("Backflow prevented: valves closed and pump stopped");
}

// Read analog LDR raw (0-4095). Use only if USE_ANALOG_LDR=true.
int readLDR(int pin) {
  if (!USE_ANALOG_LDR) return digitalRead(pin);
  int raw = analogRead(pin);
  return raw;
}

int readWaterLevelRaw() {
  if (!USE_WATER_LEVEL_SENSOR) return -1;
  int raw = analogRead(WATER_LEVEL_PIN);
  return raw;
}