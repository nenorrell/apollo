import {Request, Response} from 'express';
import {Controller} from "../Controller";
import {Routes} from "../../config/Routes/routes";
import { Route } from '../../config/Routes/resources/Route';

export class VersionController extends Controller{
    private service :Routes;

    constructor(req :Request, res :Response, route :Route){
        super(req, res, route);
        this.service = new Routes();
    }

    public displayRoutes() :void{
        console.log(this.route);
        this.responses.responseArray(200, this.service.buildRoutesArray());
    }
}