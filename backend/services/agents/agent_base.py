from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
import asyncio
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class AgentBase(ABC):
    """Base class for all AI agents in the system"""
    
    def __init__(self, agent_id: str, agent_type: str):
        self.agent_id = agent_id
        self.agent_type = agent_type
        self.status = "idle"
        self.created_at = datetime.utcnow()
        self.last_activity = datetime.utcnow()
        self.message_queue = asyncio.Queue()
        self.logger = logging.getLogger(f"agent.{agent_type}.{agent_id}")
    
    @abstractmethod
    async def process_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Process a request and return a response"""
        pass
    
    @abstractmethod
    async def initialize(self) -> bool:
        """Initialize the agent"""
        pass
    
    @abstractmethod
    async def cleanup(self) -> bool:
        """Cleanup agent resources"""
        pass
    
    async def send_message(self, target_agent: str, message: Dict[str, Any]) -> bool:
        """Send a message to another agent"""
        try:
            # In a real implementation, this would use MCP or other communication protocols
            self.logger.info(f"Sending message to {target_agent}: {message}")
            return True
        except Exception as e:
            self.logger.error(f"Failed to send message to {target_agent}: {e}")
            return False
    
    async def receive_message(self) -> Optional[Dict[str, Any]]:
        """Receive a message from the message queue"""
        try:
            if not self.message_queue.empty():
                return await self.message_queue.get()
            return None
        except Exception as e:
            self.logger.error(f"Failed to receive message: {e}")
            return None
    
    def update_status(self, status: str):
        """Update agent status"""
        self.status = status
        self.last_activity = datetime.utcnow()
        self.logger.info(f"Agent status updated to: {status}")
    
    def get_agent_info(self) -> Dict[str, Any]:
        """Get agent information"""
        return {
            "agent_id": self.agent_id,
            "agent_type": self.agent_type,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "last_activity": self.last_activity.isoformat()
        }
