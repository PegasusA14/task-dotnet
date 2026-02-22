import { useState, useEffect, useRef } from "react";
import { HubConnectionBuilder, HubConnection, LogLevel } from "@microsoft/signalr";
import type { IntersectionSnapshot } from "../types/TrafficTypes";
import { SIGNALR_HUB_URL } from "../config/env";

export type ConnectionStatus = "connecting" | "connected" | "reconnecting" | "disconnected";

export function useSignalRConnection() {
    const [snapshot, setSnapshot] = useState<IntersectionSnapshot | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        let connection: HubConnection;

        const startConnection = async () => {
            try {
                if (mounted.current) setConnectionStatus("connecting");

                connection = new HubConnectionBuilder()
                    .withUrl(SIGNALR_HUB_URL)
                    .withAutomaticReconnect()
                    .configureLogging(import.meta.env.DEV ? LogLevel.Information : LogLevel.Error)
                    .build();

                connection.on("ReceiveIntersectionState", (data: IntersectionSnapshot) => {
                    if (mounted.current) setSnapshot(data);
                });

                connection.onreconnecting(() => {
                    if (mounted.current) setConnectionStatus("reconnecting");
                });

                connection.onreconnected(() => {
                    if (mounted.current) setConnectionStatus("connected");
                });

                connection.onclose(() => {
                    if (mounted.current) setConnectionStatus("disconnected");
                });

                await connection.start();

                if (mounted.current) setConnectionStatus("connected");
            } catch (err) {
                console.error("SignalR Connection Error: ", err);
                if (mounted.current) setConnectionStatus("disconnected");
            }
        };

        startConnection();

        return () => {
            mounted.current = false;
            if (connection) {
                connection.stop();
            }
        };
    }, []);

    return { snapshot, connectionStatus };
}
