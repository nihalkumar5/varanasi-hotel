import { useEffect, useState } from "react";

import {
    DEMO_EVENTS,
    getDemoMenu,
    saveDemoMenu,
} from "@/lib/hotel/demo-store";
import { convertGDriveLink, generateLocalId, isDemoMode, isStorageOrHotelEvent } from "@/lib/hotel/helpers";
import type { MenuItem } from "@/lib/hotel/types";
import { supabase } from "@/lib/supabaseClient";

const DEFAULT_MENU_ITEMS: (hotelId: string) => MenuItem[] = (hotelId) => [
    {
        id: "default-thali",
        hotel_id: hotelId,
        category: "Main Course",
        title: "Royal Indian Thali",
        description: "A curated curation of seasonal delicacies served with fragrant saffron rice and handmade artisanal breads.",
        price: 1450,
        image_url: "/images/food/thali.png",
        is_available: true
    },
    {
        id: "default-biryani",
        hotel_id: hotelId,
        category: "Main Course",
        title: "Deluxe Clay-Pot Biryani",
        description: "Slow-cooked aromatic basmati rice with heritage spices and tender proteins, served in a traditional clay pot.",
        price: 850,
        image_url: "/images/food/biryani.png",
        is_available: true
    },
    {
        id: "default-chaat",
        hotel_id: hotelId,
        category: "Varanasi Special",
        title: "Gourmet Tamatar Chaat",
        description: "An elevated interpretation of the iconic local favorite, garnished with crispy pearls and vibrant chutneys.",
        price: 450,
        image_url: "/images/food/chaat.png",
        is_available: true
    },
    {
        id: "default-samosa",
        hotel_id: hotelId,
        category: "Starters",
        title: "Artisanal Samosa Platter",
        description: "Crispy hand-folded pastries filled with spiced heritage potatoes, served with house-made mint and tamarind dips.",
        price: 350,
        image_url: "https://images.unsplash.com/photo-1601050690597-df056fb4ce70?auto=format&fit=crop&q=80",
        is_available: true
    },
    {
        id: "default-dessert",
        hotel_id: hotelId,
        category: "Desserts",
        title: "Heritage Gulab Jamun",
        description: "Delicate syrup-soaked traditional confections served in a crystal bowl with silver leaf and crushed pistachios.",
        price: 350,
        image_url: "/images/food/dessert.png",
        is_available: true
    },
    {
        id: "default-chai",
        hotel_id: hotelId,
        category: "Drinks",
        title: "Signature Masala Chai",
        description: "Brewed with premium tea leaves and a secret blend of five aromatic spices. Served in fine bone china.",
        price: 150,
        image_url: "/images/food/tea.png",
        is_available: true
    }
];

export function useSupabaseMenuItems(hotelId?: string) {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isActive = true;

        const loadMenuItems = async () => {
            if (!hotelId) {
                if (isActive) {
                    setLoading(false);
                }
                return;
            }

            if (isDemoMode()) {
                if (isActive) {
                    const items = getDemoMenu(hotelId);
                    setMenuItems(items.length > 0 ? items : DEFAULT_MENU_ITEMS(hotelId));
                    setLoading(false);
                }
                return;
            }

            const { data } = await supabase
                .from("menu_items")
                .select("*")
                .eq("hotel_id", hotelId)
                .order("category", { ascending: true });

            if (isActive) {
                const results = (data as MenuItem[]) ?? [];
                setMenuItems(results.length > 0 ? results : DEFAULT_MENU_ITEMS(hotelId));
                setLoading(false);
            }
        };

        void loadMenuItems();

        if (!hotelId) {
            return () => {
                isActive = false;
            };
        }

        if (isDemoMode()) {
            const handleUpdate = (event: Event) => {
                if (isActive && isStorageOrHotelEvent(event, hotelId)) {
                    setMenuItems(getDemoMenu(hotelId));
                }
            };

            window.addEventListener(DEMO_EVENTS.menu, handleUpdate);
            window.addEventListener("storage", handleUpdate);

            return () => {
                isActive = false;
                window.removeEventListener(DEMO_EVENTS.menu, handleUpdate);
                window.removeEventListener("storage", handleUpdate);
            };
        }

        const subscription = supabase
            .channel(`menu_items_${hotelId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "menu_items",
                    filter: `hotel_id=eq.${hotelId}`,
                },
                () => {
                    void loadMenuItems();
                },
            )
            .subscribe();

        return () => {
            isActive = false;
            supabase.removeChannel(subscription);
        };
    }, [hotelId]);

    return { menuItems, loading };
}

export async function saveSupabaseMenuItem(hotelId: string, item: Partial<MenuItem>) {
    const imageUrl = convertGDriveLink(item.image_url ?? "");

    if (isDemoMode()) {
        const items = getDemoMenu(hotelId);

        if (item.id) {
            saveDemoMenu(
                hotelId,
                items.map((entry) =>
                    entry.id === item.id
                        ? ({ ...entry, ...item, image_url: imageUrl } as MenuItem)
                        : entry,
                ),
            );
            return { data: null, error: null };
        }

        const newItem: MenuItem = {
            id: generateLocalId("menu"),
            hotel_id: hotelId,
            category: item.category ?? "",
            title: item.title ?? "",
            description: item.description,
            price: item.price ?? 0,
            image_url: imageUrl,
            is_available: item.is_available ?? true,
        };

        saveDemoMenu(hotelId, [...items, newItem]);
        return { data: newItem, error: null };
    }

    if (item.id) {
        return supabase
            .from("menu_items")
            .update({
                category: item.category,
                title: item.title,
                description: item.description,
                price: item.price,
                image_url: imageUrl,
                is_available: item.is_available,
            })
            .eq("id", item.id);
    }

    return supabase
        .from("menu_items")
        .insert([{ ...item, image_url: imageUrl, hotel_id: hotelId }]);
}

export async function deleteSupabaseMenuItem(id: string, hotelId: string) {
    if (isDemoMode()) {
        saveDemoMenu(
            hotelId,
            getDemoMenu(hotelId).filter((item) => item.id !== id),
        );
        return { error: null };
    }

    return supabase.from("menu_items").delete().eq("id", id);
}
