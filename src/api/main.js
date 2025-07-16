import { post,get } from "./api"

export function PostVideo(data){
    return post("/parser/remote/preview/",data);
}

export function DownloadVideo(data){
    return post("/parser/Rendering/",data)
}

export function GetProject(){
    return get("/parser/get_prev_work/");
}

export function PostProject(data){
    return post("/parser/save_json/",data)
}

export function DeleteProject(data){
    return post("/parser/delete_json/",data)
}



export function GetCompleteJson(data){
    return post("/ai/translate_json/",data)
}

export function GetAIHistory(data){
    return post("/ai/history/",data)
}