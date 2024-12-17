"use client";

import Image from "next/image";
import React from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import GetIpfsUrlFromPinata from '@/app/utils';

export default function NFTCard({ item }) {
    const IPFSUrl = GetIpfsUrlFromPinata(item.image);
    const fallbackImage = "/images/fallback-image.png"; // Provide a path to your fallback image

    const limitedDescription =
        item.description.length > 50
            ? item.description.substring(0, 50)
            : item.description;

    return (
        <CardContainer className="inter-var items-center justify-center">
            <CardBody
                className="bg-gray-50 items-center justify-center text relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-60 h-50 rounded-xl p-6 border">
                <CardItem
                    translateZ="50"
                    className="text-xl font-bold text-neutral-600 dark:text-white">
                    {item.name}
                </CardItem>
                <CardItem
                    as="p"
                    translateZ="60"
                    className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300">
                    {limitedDescription}
                </CardItem>
                <CardItem translateZ="50" className="w-full mt-4">
                    <Image
                        src={IPFSUrl}
                        height={240}
                        width={400}
                        className="h-60 w-60 object-cover rounded-xl group-hover/card:shadow-xl"
                        alt="NFT Image"
                        onError={(e) => {
                            e.currentTarget.src = fallbackImage;
                        }}
                    />
                </CardItem>
            </CardBody>
        </CardContainer>
    );
}
