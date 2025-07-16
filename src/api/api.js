import axios from "axios";

export const serveAddress = "http://127.0.0.1:8000";

export function post(url,data){
    return new Promise((resolve,reject) => {
        let dataToSend = data;
        // 检查是否是预览接口
        if (url === '/parser/remote/preview/') {
            dataToSend = {
                ...data,
                "projectName": "project_name",
                "render_mode": "remote"
            };
        }
        axios
            .post(serveAddress+url,dataToSend)
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                resolve({error:error,status:"error"});
            })
    });
}


export function del(url,data){
    return new Promise((resolve,reject) => {
        axios
            .delete(serveAddress+url,data)
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                resolve({error:error,status:"error"});
            })
    });
}

export function patch(url,data){
    return new Promise((resolve,reject) => {
        axios
            .patch(serveAddress+url,data)
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                resolve({error:error,status:"error"});
            })
    });
}

// param 请求类型的 api
export function get(url,param){
    return new Promise((resolve,reject) => {
        axios
            .get(serveAddress+url,{
                params:param
            })
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                resolve({error:error,status:"error"});
            })
    });
}