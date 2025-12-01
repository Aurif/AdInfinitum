const infinitedItems = []

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
function getDisplayName(item) {
    return ('' + Item.of(item).getDisplayName().getString()).replace(/\[|\]/g, "")
}

function makeDrawer(name, items, block) {
    const FRONT_FACE = "create:creative_fluid_tank"
    const DIVIDER_FACE = "chisel_chipped_integration:unobtainable_structure_block_save"
    const SIDE_FACE = "chisel_chipped_integration:unobtainable_structure_block_load"
    const visual = `{front:"${FRONT_FACE}",front_divider:"${DIVIDER_FACE}",particle:"${SIDE_FACE}",side:"${SIDE_FACE}"}`
    const itemsFormatted = items.map((t, i) => `${i}:{Amount:1,Stack:{count:1,id:"${t}"}}`).join(",")

    const result = `functionalstorage:${block}[
        functionalstorage:style=${visual},
        block_entity_data={
            framedDrawerModelData:${visual},
            baseSize:32,drawerOptions:{"Advanced: INDICATOR":0,TOGGLE_NUMBERS:1b,TOGGLE_RENDER:1b,TOGGLE_UPGRADES:1b},
            handler:{BigItems:{${itemsFormatted}}},
            id:"functionalstorage:framed_1",isCreative:1b,isStorageUpgradeLocked:1b,isVoid:0b,
            storageUpgrades:{Items:[{Slot:0,count:1,id:"functionalstorage:creative_vending_upgrade"}],Size:4},utilityUpgrades:{Items:[],Size:3}
        },
        custom_name='"${name.replace(/'/g, "\\'")}"'
    ]`.replace(/\n\s+/g, '')
    return result
}
function getBestTagMatch(tag, reference) {
    const tagIngredient = Ingredient.of('#' + tag)
    if (tagIngredient.isEmpty()) return null

    var result = tagIngredient.first.id
    for (let it of tagIngredient.stacks)
        if (it.id.indexOf("minecraft:") === 0) result = it.id
    if (reference !== undefined)
        for (let it of tagIngredient.stacks)
            if (it.id.indexOf(reference.split(":")[0]) === 0) result = it.id

    if (result === "minecraft:barrier") return null
    return result
}
function getBlocksAndNuggets(item) {
    // TODO: fix bug with barrier blocks
    var result = null
    Item.of(item).tags.forEach(tag => {
        const tagName = ('' + tag)
        let material = ''
        if (tagName.indexOf('c:ingots/') == 0) {
            material = tagName.slice(9)
        } else if (tagName.indexOf('c:gems/') == 0) {
            material = tagName.slice(7)
        } else {
            return
        }

        const block = getBestTagMatch('c:storage_blocks/' + material, item)
        const nugget = getBestTagMatch('c:nuggets/' + material, item)
        if (block === null || nugget === null) return

        result = [nugget, item, block]
        console.log(`>>-M ${nugget} ${item} ${block}`)
    })
    return result
}
function toInfinite(item) {
    let result = makeDrawer(
        `Infinite ${getDisplayName(item)}`,
        [item],
        "framed_1"
    )

    const blocksAndNuggets = getBlocksAndNuggets(item)
    if (blocksAndNuggets) {
        result = makeDrawer(
            `Infinite ${getDisplayName(item)}`,
            blocksAndNuggets,
            "compacting_framed_drawer"
        )
    }
    // TODO: handle only two compressible
    infinitedItems.push(result)
    return result
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

        console.log(`Infinited [${output}] from [roosting]`)
    });
})

RecipeViewerEvents.addEntries('item', event => {
    for (let i of infinitedItems) event.add(i)
})