package com.example.mobile

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.le.AdvertiseCallback
import android.bluetooth.le.AdvertiseData
import android.bluetooth.le.AdvertiseSettings
import android.bluetooth.le.BluetoothLeAdvertiser
import android.content.Context
import android.os.Handler
import android.os.Looper
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity: FlutterActivity() {
    private val CHANNEL = "com.example.mobile/ble_advertiser"
    private var advertiser: BluetoothLeAdvertiser? = null
    private var currentCallback: AdvertiseCallback? = null

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            if (call.method == "startAdvertising") {
                val manufacturerDataHex = call.argument<String>("manufacturerDataHex")
                val durationMs = call.argument<Int>("durationMs") ?: 2000
                val deviceName = call.argument<String>("deviceName") ?: "BCK"

                if (manufacturerDataHex == null) {
                    result.error("INVALID_ARGUMENT", "Hex string required", null)
                    return@setMethodCallHandler
                }

                try {
                    val bytes = hexStringToByteArray(manufacturerDataHex)
                    startBleAdvertisement(bytes, deviceName, durationMs.toLong())
                    result.success(true)
                } catch (e: Exception) {
                    result.error("ADVERTISE_ERROR", e.message, null)
                }
            } else if (call.method == "stopAdvertising") {
                stopBleAdvertisement()
                result.success(true)
            } else {
                result.notImplemented()
            }
        }
    }

    private fun startBleAdvertisement(manufacturerBytes: ByteArray, deviceName: String, durationMs: Long) {
        val bluetoothManager = getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
        val adapter = bluetoothManager?.adapter ?: return
        if (!adapter.isEnabled) return

        try {
            adapter.name = deviceName
        } catch (e: Exception) {
            // Ignore permission error
        }

        advertiser = adapter.bluetoothLeAdvertiser ?: return

        stopBleAdvertisement()

        val settings = AdvertiseSettings.Builder()
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
            .setTxPowerLevel(2) // 2 = ADVERTISE_TXPOWER_MEDIUM (-7 dBm)
            .setConnectable(false)
            .setTimeout(durationMs.toInt())
            .build()

        val data = AdvertiseData.Builder()
            .setIncludeDeviceName(true)
            .setIncludeTxPowerLevel(true)
            .addManufacturerData(0xFFFF, manufacturerBytes)
            .build()

        currentCallback = object : AdvertiseCallback() {
            override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
                super.onStartSuccess(settingsInEffect)
            }

            override fun onStartFailure(errorCode: Int) {
                super.onStartFailure(errorCode)
            }
        }

        advertiser?.startAdvertising(settings, data, currentCallback)

        if (durationMs > 0) {
            Handler(Looper.getMainLooper()).postDelayed({
                stopBleAdvertisement()
            }, durationMs)
        }
    }

    private fun stopBleAdvertisement() {
        if (currentCallback != null && advertiser != null) {
            try {
                advertiser?.stopAdvertising(currentCallback)
            } catch (e: Exception) {
                // Ignore
            }
            currentCallback = null
        }
    }

    private fun hexStringToByteArray(s: String): ByteArray {
        val len = s.length
        val data = ByteArray(len / 2)
        var i = 0
        while (i < len) {
            data[i / 2] = ((Character.digit(s[i], 16) shl 4) + Character.digit(s[i + 1], 16)).toByte()
            i += 2
        }
        return data
    }
}
