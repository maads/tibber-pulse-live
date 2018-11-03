const gql = require('graphql-tag');

module.exports = {
  getHomesQuery: getHomesQuery,
  getSubscriptionQuery: getSubscriptionQuery
};

function getHomesQuery() {
  return `{
      viewer {
        homes {
          id
        }
      }
    }`;
}

function getSubscriptionQuery(homeId) {
  return gql`
        subscription{
              liveMeasurement(homeId:"${homeId}"){
                timestamp
                power
                accumulatedConsumption
                accumulatedCost
                currency
                minPower
                averagePower
                maxPower
              }
            }`;
}