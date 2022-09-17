import express from 'express';
import cors  from 'cors';

import {PrismaClient} from '@prisma/client'
import { convertHourStingToMinute } from './utils/convert-hour-strng-to-minutes';
import { convertMinutesToHourString } from './utils/convert-minutes-to-hour-string';

const app = express();

app.use(cors()); // define quais front ends podem acessar o back end

app.use(express.json());

const prisma = new PrismaClient({
    log: ['query']
});



app.get('/games', async (req, res) => {
    const games = await prisma.game.findMany({
        include:{
            _count:{
                select: {
                    ads: true,
                }
            }
        }
    })
    return res.json(games);
})


app.post('/games/:id/ads', async (req, res) => {
    const gameId = req.params.id;
    const body:any = req.body;

    const ad = await prisma.ad.create({
        data: {
            gameId,
            name: body.name,
            discord: body.discord,
            weeksDays: body.weeksDays.join(','),
            yearsPlaying: body.yearsPlaying,
            useVoiceChannel: body.useVoiceChannel,
            hourStart: convertHourStingToMinute(body.hourStart),
            hourEnd: convertHourStingToMinute(body.hourEnd),
        }
        }
    )
    return res.status(201).json(ad);
})


app.get('/games/:id/ads', async (req, res) => {
    const gameId = req.params.id;

    const ads = await prisma.ad.findMany({
        select:{
            id: true,
            name: true,
            weeksDays: true,
            yearsPlaying: true,
            useVoiceChannel: true,
            hourStart: true,
            hourEnd: true,
        },
        where:{
            gameId,
        },
        orderBy:{
            created: 'desc',
        }
    })

    return res.json(ads.map(ad =>{
        return{
            ...ad,
        weeksDays: ad.weeksDays.split(','),
        hourStart: convertMinutesToHourString(ad.hourStart),
        hourEnd: convertMinutesToHourString(ad.hourEnd),
        }
    }));
})

app.get('/ads/:id/discord', async (req, res) => {
    const adId = req.params.id;
    const ad = await prisma.ad.findUniqueOrThrow({
        select: {
            discord: true,
        },
        where:{
            id: adId,
        }
    })
    return res.json({
        discord: ad.discord,
    });
})
app.listen(3333)