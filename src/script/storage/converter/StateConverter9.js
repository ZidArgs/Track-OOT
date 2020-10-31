/**
 * move to serverside past TBD
 */

import StateConverter from "../StateConverter.js";

StateConverter.register(function(state) {
    let res = {
        data: state.data,
        extra: {},
        notes: state.notes,
        autosave: state.autosave,
        timestamp: state.timestamp,
        name: state.name
    };
    const exits = {};
    if (state.extra.exits != null) {
        for (let i of Object.keys(state.extra.exits)) {
            exits[translation[i] || i] = translation[state.extra.exits[i]] || state.extra.exits[i];
        }
    }
    res.extra = {...state.extra, exits};
    return res;
});

const translation = {
    "region.dodongos_cavern_entryway -> region.dodongos_cavern_gateway": "region.dodongos_cavern_entrance -> region.dodongos_cavern_gateway",
    "region.dodongos_cavern_gateway -> region.dodongos_cavern_entryway": "region.dodongos_cavern_gateway -> region.dodongos_cavern_entrance",
    "region.hyrule_field -> region.hf_tektite_grotto": "region.hf_tektite_grotto_entrance -> region.hf_tektite_grotto",
    "region.hf_tektite_grotto -> region.hyrule_field": "region.hf_tektite_grotto -> region.hf_tektite_grotto_entrance",
    "region.hyrule_field -> region.hf_near_kak_grotto": "region.hf_near_kak_grotto_entrance -> region.hf_near_kak_grotto",
    "region.hf_near_kak_grotto -> region.hyrule_field": "region.hf_near_kak_grotto -> region.hf_near_kak_grotto_entrance",
    "region.hyrule_field -> region.hf_fairy_grotto": "region.hf_fairy_grotto_entrance -> region.hf_fairy_grotto",
    "region.hf_fairy_grotto -> region.hyrule_field": "region.hf_fairy_grotto -> region.hf_fairy_grotto_entrance",
    "region.hyrule_field -> region.hf_near_market_grotto": "region.hf_near_market_grotto_entrance -> region.hf_near_market_grotto",
    "region.hf_near_market_grotto -> region.hyrule_field": "region.hf_near_market_grotto -> region.hf_near_market_grotto_entrance",
    "region.hyrule_field -> region.hf_cow_grotto": "region.hf_cow_grotto_entrance -> region.hf_cow_grotto",
    "region.hf_cow_grotto -> region.hyrule_field": "region.hf_cow_grotto -> region.hf_cow_grotto_entrance",
    "region.hyrule_field -> region.hf_inside_fence_grotto": "region.hf_inside_fence_grotto_entrance -> region.hf_inside_fence_grotto",
    "region.hf_inside_fence_grotto -> region.hyrule_field": "region.hf_inside_fence_grotto -> region.hf_inside_fence_grotto_entrance",
    "region.hyrule_field -> region.hf_open_grotto": "region.hf_open_grotto_entrance -> region.hf_open_grotto",
    "region.hf_open_grotto -> region.hyrule_field": "region.hf_open_grotto -> region.hf_open_grotto_entrance",
    "region.hyrule_field -> region.hf_southeast_grotto": "region.hf_southeast_grotto_entrance -> region.hf_southeast_grotto",
    "region.hf_southeast_grotto -> region.hyrule_field": "region.hf_southeast_grotto -> region.hf_southeast_grotto_entrance",
    "region.kokiri_forest -> region.kf_midos_house": "region.kf_midos_house_entrance -> region.kf_midos_house",
    "region.kf_midos_house -> region.kokiri_forest": "region.kf_midos_house -> region.kf_midos_house_entrance",
    "region.kokiri_forest -> region.kf_sarias_house": "region.kf_sarias_house_entrance -> region.kf_sarias_house",
    "region.kf_sarias_house -> region.kokiri_forest": "region.kf_sarias_house -> region.kf_sarias_house_entrance",
    "region.kokiri_forest -> region.kf_house_of_twins": "region.kf_house_of_twins_entrance -> region.kf_house_of_twins",
    "region.kf_house_of_twins -> region.kokiri_forest": "region.kf_house_of_twins -> region.kf_house_of_twins_entrance",
    "region.kokiri_forest -> region.kf_know_it_all_house": "region.kf_know_it_all_house_entrance -> region.kf_know_it_all_house",
    "region.kf_know_it_all_house -> region.kokiri_forest": "region.kf_know_it_all_house -> region.kf_know_it_all_house_entrance",
    "region.kokiri_forest -> region.kf_kokiri_shop": "region.kf_kokiri_shop_entrance -> region.kf_kokiri_shop",
    "region.kf_kokiri_shop -> region.kokiri_forest": "region.kf_kokiri_shop -> region.kf_kokiri_shop_entrance",
    "region.kokiri_forest -> region.kf_links_house": "region.kf_links_house_entrance -> region.kf_links_house",
    "region.kf_links_house -> region.kokiri_forest": "region.kf_links_house -> region.kf_links_house_entrance",
    "region.kokiri_forest -> region.kf_storms_grotto": "region.kf_storms_grotto_entrance -> region.kf_storms_grotto",
    "region.kf_storms_grotto -> region.kokiri_forest": "region.kf_storms_grotto -> region.kf_storms_grotto_entrance",
    "region.lost_woods -> region.lw_near_shortcuts_grotto": "region.lw_near_shortcuts_grotto_entrance -> region.lw_near_shortcuts_grotto",
    "region.lw_near_shortcuts_grotto -> region.lost_woods": "region.lw_near_shortcuts_grotto -> region.lw_near_shortcuts_grotto_entrance",
    "region.lw_beyond_mido -> region.lw_scrubs_grotto": "region.lw_scrubs_grotto_entrance -> region.lw_scrubs_grotto",
    "region.lw_scrubs_grotto -> region.lw_beyond_mido": "region.lw_scrubs_grotto -> region.lw_scrubs_grotto_entrance",
    "region.lw_beyond_mido -> region.deku_theater": "region.deku_theater_entrance -> region.deku_theater",
    "region.deku_theater -> region.lw_beyond_mido": "region.deku_theater -> region.deku_theater_entrance",
    "region.sfm_entryway -> region.sfm_wolfos_grotto": "region.sfm_wolfos_grotto_entrance -> region.sfm_wolfos_grotto",
    "region.sfm_wolfos_grotto -> region.sfm_entryway": "region.sfm_wolfos_grotto -> region.sfm_wolfos_grotto_entrance",
    "region.sacred_forest_meadow -> region.sfm_storms_grotto": "region.sfm_storms_grotto_entrance -> region.sfm_storms_grotto",
    "region.sfm_storms_grotto -> region.sacred_forest_meadow": "region.sfm_storms_grotto -> region.sfm_storms_grotto_entrance",
    "region.sacred_forest_meadow -> region.sfm_fairy_grotto": "region.sfm_fairy_grotto_entrance -> region.sfm_fairy_grotto",
    "region.sfm_fairy_grotto -> region.sacred_forest_meadow": "region.sfm_fairy_grotto -> region.sfm_fairy_grotto_entrance",
    "region.market_entrance -> region.market_guard_house": "region.market_guard_house_entrance -> region.market_guard_house",
    "region.market_guard_house -> region.market_entrance": "region.market_guard_house -> region.market_guard_house_entrance",
    "region.market -> region.market_mask_shop": "region.market_mask_shop_entrance -> region.market_mask_shop",
    "region.market_mask_shop -> region.market": "region.market_mask_shop -> region.market_mask_shop_entrance",
    "region.market -> region.market_bombchu_bowling": "region.market_bombchu_bowling_entrance -> region.market_bombchu_bowling",
    "region.market_bombchu_bowling -> region.market": "region.market_bombchu_bowling -> region.market_bombchu_bowling_entrance",
    "region.market -> region.market_potion_shop": "region.market_potion_shop_entrance -> region.market_potion_shop",
    "region.market_potion_shop -> region.market": "region.market_potion_shop -> region.market_potion_shop_entrance",
    "region.market -> region.market_treasure_chest_game": "region.market_treasure_chest_game_entrance -> region.market_treasure_chest_game",
    "region.market_treasure_chest_game -> region.market": "region.market_treasure_chest_game -> region.market_treasure_chest_game_entrance",
    "region.market -> region.market_bombchu_shop": "region.market_bombchu_shop_entrance -> region.market_bombchu_shop",
    "region.market_bombchu_shop -> region.market": "region.market_bombchu_shop -> region.market_bombchu_shop_entrance",
    "region.market -> region.market_man_in_green_house": "region.market_man_in_green_house_entrance -> region.market_man_in_green_house",
    "region.market_man_in_green_house -> region.market": "region.market_man_in_green_house -> region.market_man_in_green_house_entrance",
    "region.market -> region.market_bazaar": "region.market_bazaar_entrance -> region.market_bazaar",
    "region.market_bazaar -> region.market": "region.market_bazaar -> region.market_bazaar_entrance",
    "region.market -> region.market_shooting_gallery": "region.market_shooting_gallery_entrance -> region.market_shooting_gallery",
    "region.market_shooting_gallery -> region.market": "region.market_shooting_gallery -> region.market_shooting_gallery_entrance",
    "region.lon_lon_ranch -> region.llr_talons_house": "region.llr_talons_house_entrance -> region.llr_talons_house",
    "region.llr_talons_house -> region.lon_lon_ranch": "region.llr_talons_house -> region.llr_talons_house_entrance",
    "region.lon_lon_ranch -> region.llr_stables": "region.llr_stables_entrance -> region.llr_stables",
    "region.llr_stables -> region.lon_lon_ranch": "region.llr_stables -> region.llr_stables_entrance",
    "region.lon_lon_ranch -> region.llr_tower": "region.llr_tower_entrance -> region.llr_tower",
    "region.llr_tower -> region.lon_lon_ranch": "region.llr_tower -> region.llr_tower_entrance",
    "region.lon_lon_ranch -> region.llr_grotto": "region.llr_grotto_entrance -> region.llr_grotto",
    "region.llr_grotto -> region.lon_lon_ranch": "region.llr_grotto -> region.llr_grotto_entrance",
    "region.hyrule_castle_grounds -> region.childcastle_fairy_gateway": "region.hc_great_fairy_fountain_entrance -> region.hc_great_fairy_fountain",
    "region.childcastle_fairy_gateway -> region.hyrule_castle_grounds": "region.hc_great_fairy_fountain -> region.hc_great_fairy_fountain_entrance",
    "region.hyrule_castle_grounds -> region.hc_storms_grotto": "region.hc_storms_grotto_entrance -> region.hc_storms_grotto",
    "region.hc_storms_grotto -> region.hyrule_castle_grounds": "region.hc_storms_grotto -> region.hc_storms_grotto_entrance",
    "region.ganons_castle_grounds -> region.adultcastle_fairy_gateway": "region.ogc_great_fairy_fountain_entrance -> region.ogc_great_fairy_fountain",
    "region.adultcastle_fairy_gateway -> region.ganons_castle_grounds": "region.ogc_great_fairy_fountain -> region.ogc_great_fairy_fountain_entrance",
    "region.kakariko_village -> region.kak_carpenter_boss_house": "region.kak_carpenter_boss_house_entrance -> region.kak_carpenter_boss_house",
    "region.kak_carpenter_boss_house -> region.kakariko_village": "region.kak_carpenter_boss_house -> region.kak_carpenter_boss_house_entrance",
    "region.kakariko_village -> region.kak_house_of_skulltula": "region.kak_house_of_skulltula_entrance -> region.kak_house_of_skulltula",
    "region.kak_house_of_skulltula -> region.kakariko_village": "region.kak_house_of_skulltula -> region.kak_house_of_skulltula_entrance",
    "region.kakariko_village -> region.kak_impas_house": "region.kak_impas_house_entrance -> region.kak_impas_house",
    "region.kak_impas_house -> region.kakariko_village": "region.kak_impas_house -> region.kak_impas_house_entrance",
    "region.kak_impas_ledge -> region.kak_impas_house_back": "region.kak_impas_house_back_entrance -> region.kak_impas_house_back",
    "region.kak_impas_house_back -> region.kak_impas_ledge": "region.kak_impas_house_back -> region.kak_impas_house_back_entrance",
    "region.kak_backyard -> region.kak_odd_medicine_building": "region.kak_odd_medicine_building_entrance -> region.kak_odd_medicine_building",
    "region.kak_odd_medicine_building -> region.kak_backyard": "region.kak_odd_medicine_building -> region.kak_odd_medicine_building_entrance",
    "region.kakariko_village -> region.kak_bazaar": "region.kak_bazaar_entrance -> region.kak_bazaar",
    "region.kak_bazaar -> region.kakariko_village": "region.kak_bazaar -> region.kak_bazaar_entrance",
    "region.kakariko_village -> region.kak_shooting_gallery": "region.kak_shooting_gallery_entrance -> region.kak_shooting_gallery",
    "region.kak_shooting_gallery -> region.kakariko_village": "region.kak_shooting_gallery -> region.kak_shooting_gallery_entrance",
    "region.kakariko_village -> region.kak_windmill": "region.kak_windmill_entrance -> region.kak_windmill",
    "region.kak_windmill -> region.kakariko_village": "region.kak_windmill -> region.kak_windmill_entrance",
    "region.kakariko_village -> region.kak_potion_shop_front": "region.kak_potion_shop_front_entrance -> region.kak_potion_shop_front",
    "region.kak_potion_shop_front -> region.kakariko_village": "region.kak_potion_shop_front -> region.kak_potion_shop_front_entrance",
    "region.kakariko_village -> region.kak_potion_shop_back": "region.kak_potion_shop_back_entrance -> region.kak_potion_shop_back",
    "region.kak_potion_shop_back -> region.kakariko_village": "region.kak_potion_shop_back -> region.kak_potion_shop_back_entrance",
    "region.kak_backyard -> region.kak_open_grotto": "region.kak_open_grotto_entrance -> region.kak_open_grotto",
    "region.kak_open_grotto -> region.kak_backyard": "region.kak_open_grotto -> region.kak_open_grotto_entrance",
    "region.kakariko_village -> region.kak_redead_grotto": "region.kak_redead_grotto_entrance -> region.kak_redead_grotto",
    "region.kak_redead_grotto -> region.kakariko_village": "region.kak_redead_grotto -> region.kak_redead_grotto_entrance",
    "region.graveyard -> region.graveyard_dampes_house": "region.graveyard_dampes_house_entrance -> region.graveyard_dampes_house",
    "region.graveyard_dampes_house -> region.graveyard": "region.graveyard_dampes_house -> region.graveyard_dampes_house_entrance",
    "region.graveyard -> region.graveyard_shield_grave": "region.graveyard_shield_grave_entrance -> region.graveyard_shield_grave",
    "region.graveyard_shield_grave -> region.graveyard": "region.graveyard_shield_grave -> region.graveyard_shield_grave_entrance",
    "region.graveyard -> region.graveyard_heart_piece_grave": "region.graveyard_heart_piece_grave_entrance -> region.graveyard_heart_piece_grave",
    "region.graveyard_heart_piece_grave -> region.graveyard": "region.graveyard_heart_piece_grave -> region.graveyard_heart_piece_grave_entrance",
    "region.graveyard -> region.graveyard_composers_grave": "region.graveyard_composers_grave_entrance -> region.graveyard_composers_grave",
    "region.graveyard_composers_grave -> region.graveyard": "region.graveyard_composers_grave -> region.graveyard_composers_grave_entrance",
    "region.graveyard -> region.graveyard_dampes_grave": "region.graveyard_dampes_grave_entrance -> region.graveyard_dampes_grave",
    "region.graveyard_dampes_grave -> region.graveyard": "region.graveyard_dampes_grave -> region.graveyard_dampes_grave_entrance",
    "region.death_mountain_summit -> region.dmt_great_fairy_fountain": "region.dmt_great_fairy_fountain_entrance -> region.dmt_great_fairy_fountain",
    "region.dmt_great_fairy_fountain -> region.death_mountain_summit": "region.dmt_great_fairy_fountain -> region.dmt_great_fairy_fountain_entrance",
    "region.death_mountain -> region.dmt_storms_grotto": "region.dmt_storms_grotto_entrance -> region.dmt_storms_grotto",
    "region.dmt_storms_grotto -> region.death_mountain": "region.dmt_storms_grotto -> region.dmt_storms_grotto_entrance",
    "region.death_mountain_summit -> region.dmt_cow_grotto": "region.dmt_cow_grotto_entrance -> region.dmt_cow_grotto",
    "region.dmt_cow_grotto -> region.death_mountain_summit": "region.dmt_cow_grotto -> region.dmt_cow_grotto_entrance",
    "region.dmc_lower_nearby -> region.dmc_great_fairy_fountain": "region.dmc_great_fairy_fountain_entrance -> region.dmc_great_fairy_fountain",
    "region.dmc_great_fairy_fountain -> region.dmc_lower_nearby": "region.dmc_great_fairy_fountain -> region.dmc_great_fairy_fountain_entrance",
    "region.dmc_lower_nearby -> region.dmc_hammer_grotto": "region.dmc_hammer_grotto_entrance -> region.dmc_hammer_grotto",
    "region.dmc_hammer_grotto -> region.dmc_lower_nearby": "region.dmc_hammer_grotto -> region.dmc_hammer_grotto_entrance",
    "region.dmc_upper_nearby -> region.dmc_upper_grotto": "region.dmc_upper_grotto_entrance -> region.dmc_upper_grotto",
    "region.dmc_upper_grotto -> region.dmc_upper_nearby": "region.dmc_upper_grotto -> region.dmc_upper_grotto_entrance",
    "region.goron_city -> region.gc_shop": "region.gc_shop_entrance -> region.gc_shop",
    "region.gc_shop -> region.goron_city": "region.gc_shop -> region.gc_shop_entrance",
    "region.goron_city -> region.gc_grotto": "region.gc_grotto_entrance -> region.gc_grotto",
    "region.gc_grotto -> region.goron_city": "region.gc_grotto -> region.gc_grotto_entrance",
    "region.zora_river -> region.zr_storms_grotto": "region.zr_storms_grotto_entrance -> region.zr_storms_grotto",
    "region.zr_storms_grotto -> region.zora_river": "region.zr_storms_grotto -> region.zr_storms_grotto_entrance",
    "region.zora_river -> region.zr_fairy_grotto": "region.zr_fairy_grotto_entrance -> region.zr_fairy_grotto",
    "region.zr_fairy_grotto -> region.zora_river": "region.zr_fairy_grotto -> region.zr_fairy_grotto_entrance",
    "region.zora_river -> region.zr_open_grotto": "region.zr_open_grotto_entrance -> region.zr_open_grotto",
    "region.zr_open_grotto -> region.zora_river": "region.zr_open_grotto -> region.zr_open_grotto_entrance",
    "region.zoras_domain -> region.zd_shop": "region.zd_shop_entrance -> region.zd_shop",
    "region.zd_shop -> region.zoras_domain": "region.zd_shop -> region.zd_shop_entrance",
    "region.zoras_domain -> region.zd_storms_grotto": "region.zd_storms_grotto_entrance -> region.zd_storms_grotto",
    "region.zd_storms_grotto -> region.zoras_domain": "region.zd_storms_grotto -> region.zd_storms_grotto_entrance",
    "region.zoras_fountain -> region.zf_great_fairy_fountain": "region.zf_great_fairy_fountain_entrance -> region.zf_great_fairy_fountain",
    "region.zf_great_fairy_fountain -> region.zoras_fountain": "region.zf_great_fairy_fountain -> region.zf_great_fairy_fountain_entrance",
    "region.lake_hylia -> region.lh_lab": "region.lh_lab_entrance -> region.lh_lab",
    "region.lh_lab -> region.lake_hylia": "region.lh_lab -> region.lh_lab_entrance",
    "region.lake_hylia -> region.lh_fishing_hole": "region.lh_fishing_hole_entrance -> region.lh_fishing_hole",
    "region.lh_fishing_hole -> region.lake_hylia": "region.lh_fishing_hole -> region.lh_fishing_hole_entrance",
    "region.lake_hylia -> region.lh_grotto": "region.lh_grotto_entrance -> region.lh_grotto",
    "region.lh_grotto -> region.lake_hylia": "region.lh_grotto -> region.lh_grotto_entrance",
    "region.gv_fortress_side -> region.gv_carpenter_tent": "region.gv_carpenter_tent_entrance -> region.gv_carpenter_tent",
    "region.gv_carpenter_tent -> region.gv_fortress_side": "region.gv_carpenter_tent -> region.gv_carpenter_tent_entrance",
    "region.gv_fortress_side -> region.gv_storms_grotto": "region.gv_storms_grotto_entrance -> region.gv_storms_grotto",
    "region.gv_storms_grotto -> region.gv_fortress_side": "region.gv_storms_grotto -> region.gv_storms_grotto_entrance",
    "region.gerudo_valley -> region.gv_octorok_grotto": "region.gv_octorok_grotto_entrance -> region.gv_octorok_grotto",
    "region.gv_octorok_grotto -> region.gerudo_valley": "region.gv_octorok_grotto -> region.gv_octorok_grotto_entrance",
    "region.gerudo_fortress -> region.gf_storms_grotto": "region.gf_storms_grotto_entrance -> region.gf_storms_grotto",
    "region.gf_storms_grotto -> region.gerudo_fortress": "region.gf_storms_grotto -> region.gf_storms_grotto_entrance",
    "region.desert_colossus -> region.colossus_great_fairy_fountain": "region.colossus_great_fairy_fountain_entrance -> region.colossus_great_fairy_fountain",
    "region.colossus_great_fairy_fountain -> region.desert_colossus": "region.colossus_great_fairy_fountain -> region.colossus_great_fairy_fountain_entrance",
    "region.desert_colossus -> region.colossus_grotto": "region.colossus_grotto_entrance -> region.colossus_grotto",
    "region.colossus_grotto -> region.desert_colossus": "region.colossus_grotto -> region.colossus_grotto_entrance",
    "region.hyrule_castle_grounds -> region.hc_great_fairy_fountain": "region.hc_great_fairy_fountain_entrance -> region.hc_great_fairy_fountain",
    "region.hc_great_fairy_fountain -> region.hyrule_castle_grounds": "region.hc_great_fairy_fountain -> region.hc_great_fairy_fountain_entrance",
    "region.ganons_castle_grounds -> region.ogc_great_fairy_fountain": "region.ogc_great_fairy_fountain_entrance -> region.ogc_great_fairy_fountain",
    "region.ogc_great_fairy_fountain -> region.ganons_castle_grounds": "region.ogc_great_fairy_fountain -> region.ogc_great_fairy_fountain_entrance"
};