const promotions = require('./promotions.json')
const moment = require('moment')

const main = (promotions, userLocation) => {

    const isOpenPromotion = (promotion) => {

        const currentTime = moment();
        const currentDay = currentTime.format('dddd');  

        const todaySchedule = promotion.PromotionSchedule && 
                              promotion.PromotionSchedule.Active && 
                              promotion.PromotionSchedule[currentDay];

        if (!todaySchedule) 
            return false
 
        const startTime = moment(currentTime).set({ 
            hour: moment(todaySchedule.StartTime).hours(),
            minute: moment(todaySchedule.StartTime).minutes(),
            second: moment(todaySchedule.StartTime).seconds()
        });
        const endTime = moment(currentTime).set({ 
            hour: moment(todaySchedule.EndTime).hours(),
            minute: moment(todaySchedule.EndTime).minutes(),
            second: moment(todaySchedule.EndTime).seconds()
        });

        return currentTime.isAfter(startTime) && currentTime.isBefore(endTime);

    }

    const calculateDistance = (lat1, lng1, lat2, lng2 ) =>{
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI/180; // φ, λ in radians
        const φ2 = lat2 * Math.PI/180;
        const Δφ = (lat2-lat1) * Math.PI/180;
        const Δλ = (lng2-lng1) * Math.PI/180;
      
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      
        const d = R * c; // in metres
        
        return d;
    }

    const isActivePromotion = promotion => {

        if (promotion.Active) 
            return true

        if (promotion.PromotionSchedule && promotion.PromotionSchedule.Active)
            return true
        
        return false

    };

    const comparePromotions = (userLocation) => {

        return (promotion, nextPromotion) => {

            if (isOpenPromotion(promotion) && !isOpenPromotion(nextPromotion))
                return -1

            if (!isOpenPromotion(promotion) && isOpenPromotion(nextPromotion))
                return 1
            
            let currentPromotionDistance = calculateDistance(
                promotion.GeoCode.Lat,
                promotion.GeoCode.Lng, 
                userLocation.lat, 
                userLocation.lng 
            )
                
            let nextPromotionDistance = calculateDistance(
                nextPromotion.GeoCode.Lat, 
                nextPromotion.GeoCode.Lng,
                userLocation.lat, 
                userLocation.lng 
            )

            if(currentPromotionDistance > nextPromotionDistance){
                return 1
            }

            if(currentPromotionDistance < nextPromotionDistance){
                return -1
            }
                
            return 0

        }

    }

    return promotions.filter(isActivePromotion).sort(comparePromotions(userLocation));

}

main(promotions, { "lng": "34.7745049", "lat": "32.0989942" } );
