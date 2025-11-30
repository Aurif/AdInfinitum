StartupEvents.registry('item', event => {
    event.create('ad_infinitum_chicken_roosting')
        .texture("ad_infinitum:item/ad_infinitum/chicken_roosting")
        .displayName("Ad Infinitum: Chicken Roosting")
        .unstackable()
        .rarity("RARE")
        .glow(true)
        .containerItem("kubejs:ad_infinitum_chicken_roosting")
})

ItemEvents.modification(event => {
    event.modify('kubejs:ad_infinitum_chicken_roosting', item => {
        item.craftingRemainder = Item.of('kubejs:ad_infinitum_chicken_roosting')
    })
})