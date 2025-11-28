import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt';

// Menggunakan port WebSocket 8000 untuk kompatibilitas browser
const BROKER_URL = 'ws://broker.hivemq.com:8000/mqtt'; 

interface MqttMessage {
  topic: string;
  message: string;
  timestamp: number;
}

export const useMqtt = (topic: string) => {
  const [client, setClient] = useState<mqtt.MqttClient | null>(null);
  const [messages, setMessages] = useState<MqttMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const mqttClient = mqtt.connect(BROKER_URL);

    mqttClient.on('connect', () => {
      console.log(`MQTT Connected to ${BROKER_URL}`);
      setIsConnected(true);
      mqttClient.subscribe(topic, (err) => {
        if (err) {
          console.error(`Subscription error for topic ${topic}:`, err);
        } else {
          console.log(`Subscribed to topic: ${topic}`);
        }
      });
    });

    mqttClient.on('message', (receivedTopic, message) => {
      if (receivedTopic === topic) {
        const newMessage: MqttMessage = {
          topic: receivedTopic,
          message: message.toString(),
          timestamp: Date.now(),
        };
        // Simpan 10 pesan terakhir
        setMessages((prevMessages) => [newMessage, ...prevMessages].slice(0, 10)); 
      }
    });

    mqttClient.on('error', (err) => {
      console.error('MQTT Error:', err);
      setIsConnected(false);
    });

    mqttClient.on('close', () => {
      console.log('MQTT Disconnected');
      setIsConnected(false);
    });

    setClient(mqttClient);

    return () => {
      if (mqttClient) {
        mqttClient.end();
      }
    };
  }, [topic]);

  return { client, messages, isConnected };
};