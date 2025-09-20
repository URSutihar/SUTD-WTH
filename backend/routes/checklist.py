from fastapi import APIRouter, HTTPException
from models.schedule_models import ChecklistUpdateRequest
from services.supabase_service import SupabaseService

router = APIRouter()

@router.post("/checklist/mark")
async def mark_action_complete(request: ChecklistUpdateRequest):
    """Mark an action as complete or incomplete"""
    # Temporarily disabled until database migration is complete
    return {
        "success": True,
        "action_id": request.action_id,
        "completed": request.completed,
        "message": "Checklist temporarily disabled - run database migration to enable"
    }
    
    # try:
    #     supabase = SupabaseService()
    #     
    #     success = await supabase.update_action_completion(
    #         request.action_id,
    #         request.completed
    #     )
    #     
    #     if not success:
    #         raise HTTPException(status_code=404, detail="Action not found")
    #     
    #     return {
    #         "success": True,
    #         "action_id": request.action_id,
    #         "completed": request.completed
    #     }
    #     
    # except HTTPException:
    #     raise
    # except Exception as e:
    #     raise HTTPException(status_code=500, detail=str(e))
