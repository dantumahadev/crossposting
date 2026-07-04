from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import ConnectedAccount, User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/accounts", tags=["accounts"])

@router.get("")
def list_accounts(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    stmt = select(ConnectedAccount).where(ConnectedAccount.user_id == current_user.id)
    accounts = session.exec(stmt).all()
    
    results = []
    for acc in accounts:
        results.append({
            "id": acc.id,
            "platform": acc.platform,
            "account_name": acc.account_name,
            "external_account_id": acc.external_account_id,
            "expires_at": acc.expires_at,
            "scopes": acc.scopes,
            "status": acc.status
        })
    return results

@router.delete("/{account_id}")
def disconnect_account(account_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    acc = session.get(ConnectedAccount, account_id)
    if not acc or acc.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Account not found.")
    
    acc.status = "revoked"
    session.add(acc)
    session.commit()
    return {"message": f"Account {acc.platform} disconnected."}
