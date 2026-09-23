import { Module } from "@nestjs/common";
import { AppGateway } from "./websocket.gateway";
import { UserService } from "../user/user.service";
import { PlayerService } from "../player/player.service";
import { LobbyService } from "../lobby/lobby.service";
import { PrismaService } from "../prisma/prisma.service";
import { GameService } from "../game/game.service";
import { ShipService } from "../ship/ship.service";

@Module({
    providers: [AppGateway, PrismaService],
})
export class WebsocketModule{}