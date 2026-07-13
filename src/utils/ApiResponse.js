class ApiResponse{
    constructor( statusCode , data , message = "Success"){
        this.statusCode = statusCode,
        this.data = data,
        this.message = message,
        this.success = statusCode < 400
        //Any HTTP status code below 400 is automatically treated as success, and 400+ is automatically false. 

        //No need to set the success true or false manually. 
    }
}

export {ApiResponse}