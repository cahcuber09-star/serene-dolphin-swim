import React from 'react';
import { useMqtt } from '@/hooks/useMqtt';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import MqttMessageDisplay from './MqttMessageDisplay';

interface MqttDataListProps {
  title: string;
  topic: string;
}

const MqttDataList: React.FC<MqttDataListProps> = ({ title, topic }) => {
  const { messages, isConnected } = useMqtt(topic);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Connecting..."}
          </Badge>
          {!isConnected && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </CardHeader>
      <CardContent className="flex-grow pt-4">
        <p className="text-sm text-muted-foreground mb-2">Topic: {topic}</p>
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground">Waiting for data on topic {topic}...</p>
          ) : (
            <ul className="space-y-2">
              {messages.map((msg, index) => (
                <MqttMessageDisplay key={index} msg={msg} />
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default MqttDataList;