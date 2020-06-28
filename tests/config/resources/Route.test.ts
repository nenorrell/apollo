import {expect} from "chai";
import { Route } from "../../../src/config/Routes/resources/Route";
import { RouteParamType, ParamDataTypes } from "../../../src/config/Routes/resources/RouteParamType";


describe('Routes', ()=> {
    let route :Route;
    beforeEach(()=>{
        route = new Route()
        .setMethod("POST")
        .setPath("/examples/complex/:someParam")
        .setDescription("This endpoint is an example of what a more complex route might look like")
        .setCustomControllerPath("examples/examples.controller.ts")
        .setAction("index")
        .setPathParam([
            new RouteParamType()
            .setName("someParam")
            .setDescription("Some path param")
            .setType(ParamDataTypes.number)
            .setRequired(true)
        ])
        .setQueryParams([
            new RouteParamType()
            .setName("test")
            .setRequired(true)
            .setType(ParamDataTypes.string)
        ])
        .setBodySchema([
            new RouteParamType()
            .setName("group")
            .setDescription("Group object")
            .setRequired(true)
            .setType(ParamDataTypes.object)
            .setChildren([
                new RouteParamType()
                .setName("name")
                .setDescription("The Name of the group")
                .setRequired(true)
                .setType(ParamDataTypes.string),
        
                new RouteParamType()
                .setName("Level")
                .setDescription("The level of the group")
                .setRequired(true)
                .setType(ParamDataTypes.string),
        
                new RouteParamType()
                .setName("members")
                .setDescription("The level of the group")
                .setRequired(true)
                .setType(ParamDataTypes.array)
                .setChildren([
                    new RouteParamType()
                    .setName("name")
                    .setDescription("The name of the group user")
                    .setRequired(true)
                    .setType(ParamDataTypes.string),
        
                    new RouteParamType()
                    .setName("level")
                    .setDescription("The level of the group user")
                    .setRequired(true)
                    .setType(ParamDataTypes.number)
                ])
            ])
        ]);
    })

    describe("Body Schema", ()=> {
        it('Should build body schema properly', (done)=>{
            expect(route.bodySchema).to.be.an("array");
            expect(route.bodySchema[0] instanceof RouteParamType).to.eq(true);

            expect(route.bodySchema[0].children).to.be.an("array");
            expect(route.bodySchema[0].children.length).to.be.eq(3);
            expect(route.bodySchema[0].children[0] instanceof RouteParamType).to.eq(true);

            expect(route.bodySchema[0].children[2].children).to.be.an("array");
            expect(route.bodySchema[0].children[2].children.length).to.be.eq(2);
            expect(route.bodySchema[0].children[2].children[0] instanceof RouteParamType).to.eq(true);
            done();
        });

        it("Should format body schema properly", (done)=>{
            expect(route.formattedBodySchema).to.be.an("object");
            expect(route.formattedBodySchema).to.deep.eq({
                "group": {
                    "name": {
                        "name": "name",
                        "description": "The Name of the group",
                        "required": true,
                        "type": "string"
                    },
                    "Level": {
                        "name": "Level",
                        "description": "The level of the group",
                        "required": true,
                        "type": "string"
                    },
                    "members": [
                        {
                            "name": {
                                "name": "name",
                                "description": "The name of the group user",
                                "required": true,
                                "type": "string"
                            },
                            "level": {
                                "name": "level",
                                "description": "The level of the group user",
                                "required": true,
                                "type": "number"
                            }
                        }
                    ]
                }
            });
            done();
        });
    });
});