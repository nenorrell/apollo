import {Request, Response, NextFunction} from 'express';
import {Controller} from "../Controller";
import {VersionService} from "./version.service";
import { Route } from '../../config/Routes/resources/Route';

export class VersionController extends Controller{
    private service :VersionService;

    constructor(req :Request, res :Response, next :NextFunction, route :Route){
        super(req, res, next, route);
        this.service = new VersionService();
    }

    public getVersion() :void{
        this.responses.responseObject(200, {version: this.service.getVersion()})
    }
}