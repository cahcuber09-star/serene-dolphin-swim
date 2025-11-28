import React from 'react';

interface MqttMessage {
  topic: string;
  message: string;
  timestamp: number;
}

interface MqttMessageDisplayProps {
  msg: MqttMessage;
}

const MqttMessageDisplay: React.FC<MqttMessageDisplayProps> = ({ msg }) => {
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  let parsedData: Record<string, unknown> | null = null;
  let isJson = false;

  try {
    const data = JSON.parse(msg.message);
    if (typeof data === 'object' && data !== null) {
      parsedData = data;
      isJson = true;
    }
  } catch (e) {
    // If parsing fails, treat it as plain text
  }

  return (
    <li className="flex justify-between items-start p-2 bg-secondary/50 rounded-md">
      <div className="flex flex-col w-full">
        {isJson && parsedData ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {Object.entries(parsedData).map(([key, value]) => (
              <React.Fragment key={key}>
                <span className="font-semibold text-primary/80 capitalize">{key}:</span>
                <span className="font-mono text-foreground truncate">{String(value)}</span>
              </React.Fragment>
            ))}
          </div>
        ) : (
          <span className="font-mono text-sm truncate">{msg.message}</span>
        )}
      </div>
      <span className="text-xs text-muted-foreground ml-4 flex-shrink-0 mt-1">
        {formatTimestamp(msg.timestamp)}
      </span>
    </li>
  );
};

export default MqttMessageDisplay;