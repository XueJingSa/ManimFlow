import { post,get,del,patch } from "./api"

export function CreateNewChat(data){
    return post("/ai/chat/create/",data)
}

export function HistoryList(data){
    return get("/ai/chat/list/",data)
}

export function SendDescription(conversation_id,data){
    return post(`/ai/chat/${conversation_id}/sse_init/`,data)
}

export function GetHistory(conversation_id){
    return get(`/ai/chat/${conversation_id}/`)
}

export function EditTitle(conversation_id,data){
    return patch(`/ai/chat/${conversation_id}/`,data)
}

export function DeleteDialog(conversation_id){
    return del(`/ai/chat/${conversation_id}/`)
}