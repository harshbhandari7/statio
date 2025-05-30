from typing import Dict, Set
from fastapi import WebSocket
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {
            "status": set(),
            "incidents": set(),
        }

    async def connect(self, websocket: WebSocket, client_type: str):
        await websocket.accept()
        self.active_connections[client_type].add(websocket)

    def disconnect(self, websocket: WebSocket, client_type: str):
        self.active_connections[client_type].remove(websocket)

    async def broadcast_status_update(self, message: dict):
        for connection in self.active_connections["status"]:
            try:
                await connection.send_json(message)
            except:
                await self.disconnect(connection, "status")

    async def broadcast_incident_update(self, message: dict):
        for connection in self.active_connections["incidents"]:
            try:
                await connection.send_json(message)
            except:
                await self.disconnect(connection, "incidents")

manager = ConnectionManager() 