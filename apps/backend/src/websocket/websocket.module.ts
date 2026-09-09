import { Module } from "@nestjs/common";
import { AppGateway } from "./websocket.gateway";
import { UserService } from "../user/user.service";
import { PlayerService } from "../player/player.service";
import { LobbyService } from "../lobby/lobby.service";
import { PrismaService } from "../prisma/prisma.service";

@Module({
    providers: [LobbyService, PlayerService, UserService, AppGateway, PrismaService],
})
export class WebsocketModule{}