import { useEffect, useState } from "react";

import {
    DEMO_EVENTS,
    getDemoOffers,
    removeDemoOfferById,
    saveDemoOffers,
} from "@/lib/hotel/demo-store";
import { convertGDriveLink, generateLocalId, isDemoMode, isStorageOrHotelEvent } from "@/lib/hotel/helpers";
import type { SpecialOffer } from "@/lib/hotel/types";
import { supabase } from "@/lib/supabaseClient";

const DEFAULT_OFFERS: (hotelId: string) => SpecialOffer[] = (hotelId) => [
    {
        id: "default-offer-spa",
        hotel_id: hotelId,
        title: "Royal Wellness Spa",
        description: "Experience the pinnacle of serenity with our signature Ayurvedic treatments and lotus-infused therapy rooms.",
        image_url: "/images/offers/spa.png",
        is_active: true
    },
    {
        id: "default-offer-dining",
        hotel_id: hotelId,
        title: "Private Sunset Dining",
        description: "A candle-lit gourmet experience overlooking the sacred Ganges. Private boat boarding and curated multi-course menu included.",
        image_url: "/images/offers/dining.png",
        is_active: true
    }
];

export function useSpecialOffers(hotelId?: string) {
    const [offers, setOffers] = useState<SpecialOffer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isActive = true;

        const loadOffers = async () => {
            if (!hotelId) {
                if (isActive) {
                    setLoading(false);
                }
                return;
            }

            if (isDemoMode()) {
                if (isActive) {
                    const items = getDemoOffers(hotelId);
                    setOffers(items.length > 0 ? items : DEFAULT_OFFERS(hotelId));
                    setLoading(false);
                }
                return;
            }

            const { data } = await supabase
                .from("special_offers")
                .select("*")
                .eq("hotel_id", hotelId)
                .order("created_at", { ascending: false });

            if (isActive) {
                const results = (data as SpecialOffer[]) ?? [];
                setOffers(results.length > 0 ? results : DEFAULT_OFFERS(hotelId));
                setLoading(false);
            }
        };

        void loadOffers();

        if (!hotelId) {
            return () => {
                isActive = false;
            };
        }

        if (isDemoMode()) {
            const handleUpdate = (event: Event) => {
                if (isActive && isStorageOrHotelEvent(event, hotelId)) {
                    setOffers(getDemoOffers(hotelId));
                }
            };

            window.addEventListener(DEMO_EVENTS.offers, handleUpdate);
            window.addEventListener("storage", handleUpdate);

            return () => {
                isActive = false;
                window.removeEventListener(DEMO_EVENTS.offers, handleUpdate);
                window.removeEventListener("storage", handleUpdate);
            };
        }

        const subscription = supabase
            .channel(`special_offers_${hotelId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "special_offers",
                    filter: `hotel_id=eq.${hotelId}`,
                },
                () => {
                    void loadOffers();
                },
            )
            .subscribe();

        return () => {
            isActive = false;
            supabase.removeChannel(subscription);
        };
    }, [hotelId]);

    return { offers, loading };
}

export async function saveSpecialOffer(hotelId: string, offer: Partial<SpecialOffer>) {
    const imageUrl = convertGDriveLink(offer.image_url ?? "");

    if (isDemoMode()) {
        const offers = getDemoOffers(hotelId);

        if (offer.id) {
            saveDemoOffers(
                hotelId,
                offers.map((item) =>
                    item.id === offer.id
                        ? ({ ...item, ...offer, image_url: imageUrl } as SpecialOffer)
                        : item,
                ),
            );
            return { data: null, error: null };
        }

        const newOffer: SpecialOffer = {
            id: generateLocalId("offer"),
            hotel_id: hotelId,
            title: offer.title ?? "",
            description: offer.description ?? "",
            image_url: imageUrl,
            is_active: offer.is_active ?? true,
        };

        saveDemoOffers(hotelId, [...offers, newOffer]);
        return { data: newOffer, error: null };
    }

    if (offer.id) {
        return supabase
            .from("special_offers")
            .update({
                title: offer.title,
                description: offer.description,
                image_url: imageUrl,
                is_active: offer.is_active,
            })
            .eq("id", offer.id);
    }

    return supabase
        .from("special_offers")
        .insert([{ ...offer, image_url: imageUrl, hotel_id: hotelId }]);
}

export async function deleteSpecialOffer(id: string, hotelId?: string) {
    if (isDemoMode()) {
        return { data: null, error: removeDemoOfferById(id) ? null : { message: "Offer not found" } };
    }

    let query = supabase.from("special_offers").delete().eq("id", id);

    if (hotelId) {
        query = query.eq("hotel_id", hotelId);
    }

    return query;
}
