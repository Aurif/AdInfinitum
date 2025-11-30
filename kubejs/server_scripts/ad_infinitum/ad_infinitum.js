function getPath(obj, path) {
    let current = obj
    for (let p of path) {
        if (!current) return null
        current = current.get(p)
    }
    if (current.isString()) {
        if (Item.of(current.getAsString()).isEmpty()) return null
        return current.getAsString()
    }
    return current
}

const FRONT_FACE = "ae2:creative_energy_cell"
const SIDE_FACE = "chisel_chipped_integration:unobtainable_structure_block_load"

function toInfinite(item) {
    const itemDisplayName = ('' + Item.of(item).getDisplayName().getString()).replace(/\[|\]/g, "")
    const visual = `{front:"${FRONT_FACE}",front_divider:"${SIDE_FACE}",particle:"${SIDE_FACE}",side:"${SIDE_FACE}"}`
    return `functionalstorage:framed_1[
        functionalstorage:style=${visual},
        block_entity_data={
            framedDrawerModelData:${visual},
            baseSize:32,drawerOptions:{"Advanced: INDICATOR":0,TOGGLE_NUMBERS:1b,TOGGLE_RENDER:1b,TOGGLE_UPGRADES:1b},
            handler:{BigItems:{0:{Amount:1,Stack:{count:1,id:"${item}"}}}},
            id:"functionalstorage:framed_1",isCreative:1b,isStorageUpgradeLocked:1b,isVoid:0b,
            storageUpgrades:{Items:[{Slot:0,count:1,id:"functionalstorage:creative_vending_upgrade"}],Size:4},utilityUpgrades:{Items:[],Size:3}
        },
        custom_name='"Infinite ${itemDisplayName.replace(/'/g, "\\'")}"'
    ]`.replace(/\n\s+/g, '')
}

ServerEvents.recipes(event => {
    event.custom({
        type: 'avaritia:compressor',
        cost: 100000,
        ingredients: [{ tag: "c:seeds/tier9orup" }],
        result: {
            id: "kubejs:ad_infinitum_chicken_roosting",
        }
    })

    event.forEachRecipe({ type: 'chicken_roost:roost_output' }, recipe => {
        let chicken = getPath(recipe.json, ["chicken", "item"])
        let output = getPath(recipe.json, ["output", "item"])
        if (!chicken || !output) return

        event.shaped(
            toInfinite(output),
            [
                'QWC',
                'ERT',
                'YUS'
            ],
            {
                C: chicken + '[chicken_roost:chickenlevel=128]',
                S: 'kubejs:ad_infinitum_chicken_roosting',
                Q: 'modularrouters:speed_upgrade',
                W: 'modularrouters:puller_module_2',
                E: '#c:storage_blocks/feather',
                R: 'modularrouters:modular_router',
                T: '#c:roosts',
                Y: 'modularrouters:stack_upgrade',
                U: 'modularrouters:sender_module_2'
            }
        )
        // TODO: entry in JEI for each infinite barrel
        // TODO: mod name in JEI?

        console.log(`Infinited [${output}] from [roosting]`)
    });
})