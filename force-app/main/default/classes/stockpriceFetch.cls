public with sharing class stockpriceFetch {

    @AuraEnabled
    public static list<stock> getStockDetails(){
        String url = 'https://financialmodelingprep.com/api/v3/symbol/NSE?' + getKey();
        String response = getResponse(url);
       // stock ex = (stock)JSON.deserialize(response, stock.class);
		//system.debug('ex-->'+ex);
		list<portfolio__c> listofstockstoUpdate = new list<portfolio__c>();
        list<stock> returnlist = new list<stock>();
		list<stock> listofres = (list<stock>)JSON.deserialize(response,list<stock>.class);
        system.debug(listofres.size());
        list<portfolio__c> listofstocks = [SELECT Id, Name, Qty__c, Previous_Closing_Price__c, Change_pct__c, Average_Price__c FROM portfolio__c];
        for(Integer i=0;i<listofstocks.size();i++){
            system.debug(listofstocks[i].Name+'.NS');
            string str = listofstocks[i].Name+'.NS';
            for(Integer j=0;j<listofres.size();j++){
                if(str == listofres[j].symbol){
                    listofstocks[i].Previous_Closing_Price__c = listofres[j].price;
                    listofstocks[i].Change_pct__c = listofres[j].changesPercentage;
                    listofstocks[i].PE__c = listofres[j].pe;
                    listofstockstoUpdate.add(listofstocks[i]);
                    returnlist.add(listofres[j]);
                }
            }            
        }
        response = updatestocks(listofstockstoUpdate);
        system.debug('from API-->'+returnlist);
        return returnlist;
    }

    public static string updatestocks(list<portfolio__c> listofstockstoUpdate){
        if (!listofstockstoUpdate.isEmpty()) {
            system.debug(listofstockstoUpdate.size());
            update listofstockstoUpdate;
            return 'Yes';
        }
        else{
            return 'No';
        }
    }
    @AuraEnabled
    public static String getResponse(String strUrl){
     Http h  = new Http();
     HttpRequest req = new HttpRequest();
     HttpResponse res = new HttpResponse();
     req.setMethod('GET');
     req.setEndpoint(strUrl);
     req.setTimeout(120000);
     res = h.send(req);
     String responseBody = res.getBody();
     return responseBody;
    }

    @AuraEnabled
    public static String getKey(){
     String key = 'mK3HCOjr911Qe2zCX07ME7z9coqhO5Bv'; // System.Label.WeatherApiKey
     String output = 'apikey=' + key;
     return output;
    }
    public with sharing class stock {
        @AuraEnabled
        public string symbol {get;set;} 
        @AuraEnabled
        public string earningsAnnouncement {get;set;}        
        @AuraEnabled
        public double price {get;set;} 
        @AuraEnabled
        public double changesPercentage {get;set;}
        @AuraEnabled
        public double marketCap {get;set;}
        @AuraEnabled
        public double open {get;set;}
        @AuraEnabled
        public double previousClose {get;set;} 
        @AuraEnabled
        public double pe {get;set;} 
        @AuraEnabled
        public double eps {get;set;} 
    }
}