// Find new or missed products.
// Compare new and previous feed by products id.

const fs = require('fs')
const buildFeedSimpleObject = require('./build-feed-simple-object')
const feedsDataHistoryPath = './handlers/aveopt/feedsDataHistory.json'

module.exports = (
    offers,
    feedObject,
    previousFeedData,
    previousFeedDataFilePath
) => {
    const prevFeed = previousFeedData
    const newFeed = buildFeedSimpleObject(offers, feedObject)

    // Print feed dates
    console.log(
        `Previous Feed Date: ${prevFeed.date}\nNew Feed Date: ${feedObject.yml_catalog.$.date}\n`
    )

    // Find new products
    const newProductsIdList = newFeed.offersID.filter(
        (newFeedId) =>
            !prevFeed.offersID.find((prevFeedId) => newFeedId === prevFeedId)
    )
    console.log(`NEW PRODUCTS ID\n${newProductsIdList.join('\n')}\n`)

    // Find missed products
    const missedProductsIdList = prevFeed.offersID.filter(
        (prevFeedId) =>
            !newFeed.offersID.find((newFeedId) => newFeedId === prevFeedId)
    )
    console.log(`MISSED PRODUCTS ID\n${missedProductsIdList.join('\n')}\n`)

    if (newProductsIdList.length || missedProductsIdList.length) {
        console.log(`UPDATE FILE ${previousFeedDataFilePath}`)

        // Save new and missed products
        const feedsDataHistoryList = JSON.parse(
            fs.readFileSync(feedsDataHistoryPath)
        )
        feedsDataHistoryList.push({
            date: newFeed.date,
            newProductsID: newProductsIdList,
            missedProductsID: missedProductsIdList
        })
        fs.writeFileSync(
            feedsDataHistoryPath,
            JSON.stringify(feedsDataHistoryList)
        )
    }
}
