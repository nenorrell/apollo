import {Request, Response, NextFunction, request} from 'express';
import { Responses } from './Responses';
import { Route } from '../config/Routes/resources/Route';
import { RouteParamType, ParamDataTypes} from '../config/Routes/resources/RouteParamType';
import { ErrorInterface } from '../config/resources/ErrorInterface';

export class Controller{
    private res :Response;
    private req :Request;
    public responses :Responses;
    public route :Route;
    public next :NextFunction;

    constructor(req :Request, res :Response, next :NextFunction, route :Route){
        // TODO
        // Validate that the request body is valid content type determined by the route
        // (Default will be JSON)
        try{
            this.req = req;
            this.res = res;
            this.next = next;
            this.responses = new Responses(this.res);
            this.route = route;
            this.validatePathParams();
            this.validateQueryParams();
            this.validateReqBody();
        }
        catch(e){
            throw e;
        }
    }

    private validatePathParams() :void{
        try{
            if(this.route.pathParams){
                this.route.pathParams.forEach((param :RouteParamType)=>{
                    let pathParam = this.req.params[param.name];
                    // console.log(pathParam)
                    this.validatePathParamType(param, pathParam);
                });
            }
        }
        catch(e){
            throw e;
        }
    }

    private validateQueryParams() :void{
        if(this.route.queryParams){
            this.route.queryParams.forEach((param :RouteParamType)=>{
                let queryParam = this.req.query[param.name];
                this.validateRequiredParam(param, queryParam);
                this.validateParamType(param, queryParam);
            });
        }
    }

    private validateReqBody() :void{
        if(this.route.bodySchema){
            if(!this.req.body){
                throw this.formatError(400, "Payload is expected");
            }
        }
    }

    private validateRequiredParam(param :RouteParamType, requestParam :any) :void{
        if(param.required && !requestParam){
            let err = `${param.name} was not sent and is required`;
            throw this.formatError(400, err);
        }
    }

    private validateParamType(param :RouteParamType, requestParam :any) :void{
        if(requestParam){
            if(!this.isValidTypes(param.type, requestParam)){
                let err = `Invalid param type for ${param.name}: Expected ${param.typeDisplayValue} but got ${typeof requestParam}`;
                throw this.formatError(400, err);
            }
        }
    }

    private validatePathParamType(param :RouteParamType, requestParam :any) :void{
        if(requestParam){
            if(!this.isValidTypes(param.type, requestParam)){
                let err = `${this.route.method.toString().toUpperCase()} ${this.req.path} is not a valid request path`;
                throw this.formatError(400, err);
            }
        }
    }

    private isValidTypes(type :ParamDataTypes, paramValue :any) :Boolean{
        let isValid :Boolean = true;
        switch(type){
            case ParamDataTypes.boolean:
                let value = typeof paramValue == "string" ? this.parseBool(paramValue) : paramValue;
                if(typeof value !== "boolean"){
                    isValid = false;
                }
                break;
            
            case ParamDataTypes.number:
                if(isNaN(parseInt(paramValue))){
                    isValid = false;
                }
                break;
            
            case ParamDataTypes.object:
                if(!(typeof paramValue === "object")){
                    isValid = false;
                }
                break;
            
            case ParamDataTypes.string:
                if(typeof paramValue != "string"){
                    isValid = false;
                }
                break;

            case ParamDataTypes.array:
                if(!Array.isArray(paramValue)){
                    isValid = false;
                }
                break;

            default:
                isValid = false;
        }

        return isValid;
    }

    private parseBool(stringIn :string) :Boolean{
        try{
            if(stringIn === "false"){
                return false;
            }
            if(stringIn === "true"){
                return true;
            }
            throw Error("Invalid value supplied");
        }
        catch(e){
            throw e;
        }
    }

    public formatError(status :number, details :any) :ErrorInterface{
        return {
            status,
            details
        }
    }
}