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
        features {
          realTimeConsumptionEnabled
        }
      }
    }
  }
  `;
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