from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.api.websockets.manager import manager

router = APIRouter()

@router.websocket("/ws/status")
async def websocket_status_endpoint(websocket: WebSocket):
    await manager.connect(websocket, "status")
    try:
        while True:
            data = await websocket.receive_text()
            # Handle any incoming messages if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket, "status")

@router.websocket("/ws/incidents")
async def websocket_incidents_endpoint(websocket: WebSocket):
    await manager.connect(websocket, "incidents")
    try:
        while True:
            data = await websocket.receive_text()
            # Handle any incoming messages if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket, "incidents") 