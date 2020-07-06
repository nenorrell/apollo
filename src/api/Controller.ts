import {Request, Response, NextFunction, request} from 'express';
import { Responses } from './Responses';
import { Route } from '../config/Routes/resources/Route';
import { RouteParamType, ParamDataTypes} from '../config/Routes/resources/RouteParamType';
import { formatError } from '../modules/utility';
import { Policies } from '../config/Routes/Policies';
import { Apollo } from '../config/App';
// import { PoolConnection } from 'mysql';

export class Controller{
    public responses :Responses;
    private req :Request; 
    private res :Response;
    public next :NextFunction;
    public route :Route;
    // private db ?:PoolConnection;

    constructor(Apollo :Apollo){
        try{
            this.req = Apollo.req;
            this.res = Apollo.res;
            this.next = Apollo.next;
            this.route = Apollo.currentRoute;
            // this.db = Apollo.db;

            this.responses = new Responses(this.res);
            this.checkPolicies(new Policies(this.req, this.res, this.next), this.route);
            this.validatePathParams();
            this.validateQueryParams();
            this.validateReqBody();
        }
        catch(e){
            throw e;
        }
    }

    private checkPolicies(policies :Policies, route :Route){
        if(route.policies){
            route.policies.forEach(policyName => {
                policies.runPolicy(policyName)
            });
        }
    }

    private validatePathParams() :void{
        try{
            if(this.route.pathParams){
                this.route.pathParams.forEach((param :RouteParamType)=>{
                    let pathParam = this.req.params[param.name];
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
                throw formatError(400, "Payload is expected");
            }
        }
    }

    private validateRequiredParam(param :RouteParamType, requestParam :any) :void{
        if(param.required && !requestParam){
            let err = `${param.name} was not sent and is required`;
            throw formatError(400, err);
        }
    }

    private validateParamType(param :RouteParamType, requestParam :any) :void{
        if(requestParam){
            if(!this.isValidTypes(param.type, requestParam)){
                let err = `Invalid param type for ${param.name}: Expected ${param.typeDisplayValue} but got ${typeof requestParam}`;
                throw formatError(400, err);
            }
        }
    }

    private validatePathParamType(param :RouteParamType, requestParam :any) :void{
        if(requestParam){
            if(!this.isValidTypes(param.type, requestParam)){
                let err = `${this.route.method.toString().toUpperCase()} ${this.req.path} is not a valid request path`;
                throw formatError(400, err);
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
}