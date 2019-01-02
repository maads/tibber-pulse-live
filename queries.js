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
                voltagePhase1
                voltagePhase2
                voltagePhase3
                currentPhase1
                currentPhase2
                currentPhase3
              }
            }`;
}