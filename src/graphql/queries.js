/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getAutomaCard = `query GetAutomaCard($id: ID!) {
  getAutomaCard(id: $id) {
    id
    favorite
    military
    science
    exploration
    technology
    topple
    income
    conquertiebreaker
    automatrack
    shadowtrack
  }
}
`;
export const listAutomaCards = `query ListAutomaCards(
  $filter: ModelAutomaCardFilterInput
  $limit: Int
  $nextToken: String
) {
  listAutomaCards(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      favorite
      military
      science
      exploration
      technology
      topple
      income
      conquertiebreaker
      automatrack
      shadowtrack
    }
    nextToken
  }
}
`;
