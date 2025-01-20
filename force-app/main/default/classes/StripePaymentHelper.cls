public with sharing class StripePaymentHelper {

    public static String baseURL = 'https://api.stripe.com';
    public static Map<String, Map<String, Object>> productDataMap = new Map<String, Map<String, Object>>();
    public static String secretKey;
    public static String publicKey;

    static{
        Stripe_Credentials__mdt credentials = Stripe_Credentials__mdt.getInstance('Stripe_Credentials');
        secretKey = credentials.secretKey__c;//Stripe Secret Key 
        publicKey = credentials.publicKey__c;//Stripe Public key 
    }

	@AuraEnabled(cacheable=true)
	public static List<OpportunityLineItem> getOpportunityLineItems(String parentId){
		return [ SELECT ID, OpportunityId, Name, Product2Id,  Product2.Name, ProductCode, TotalPrice, Quantity FROM OpportunityLineItem where OpportunityId =: parentId ];
	}

    @AuraEnabled(cacheable=true)
    public static String sendPaymentRequest(String productsJson){
        List<OpportunityLineItem> productList = (List<OpportunityLineItem>)JSON.deserialize(productsJson, List<OpportunityLineItem>.class);
        String opptyId = productList[0].OpportunityId;
        for(OpportunityLineItem item: productList){
            Map<String, Object> productData = new Map<String, Object>{ 'Id' => item.Id, 'Quantity' => item.Quantity };
            String jsonStr = createPrice(item);
            if(jsonStr != null){
                 Map<String, Object> responseMap = (Map<String, Object>)JSON.deserializeUntyped(jsonStr);
                 String priceId = (String)responseMap.get('id');
                 if(priceId != null){
                    productDataMap.put(item.id, new Map<String, Object>{ 'responseId' => priceId, 'productData' => productData}); 
                 }else{
                    throw new AuraHandledException('Something Went Wrong: Price Not generated');
                 } 
            }
        }
        if(!productDataMap.isEmpty()){
            String paymentLinkresponse = createPayementLink();
            if(paymentLinkresponse!=null){
                 Map<String, Object> responseObjMap = (Map<String,Object>) JSON.deserializeUntyped(paymentLinkresponse);
                 String paymentURL = String.valueOf(responseObjMap.get('url'));
                 if(paymentURL!=null){
                  String response =  sendEmailToCustomerForPayment(paymentURL, opptyId);
                  if(response.contains('Error')){
                    throw new AuraHandledException('Something Went Wrong:Email not sent to Customer');
                  }
                 }else{
                   throw new AuraHandledException('Something Went Wrong:Paymentlink Not generated');
                 }         
            }
          }
        return 'Success';
    } 
    //This method is for sending Email to customer
    public static string sendEmailToCustomerForPayment(String paymentURL, String opportunityId){
        Opportunity opportunity = [SELECT Id, Name,  Account.Name, OwnerId, Owner.Email,Owner.Name  FROM Opportunity WHERE Id =: opportunityId ];
        if (opportunity == null) {
            return 'Error: Opportunity with Id "' + opportunityId + '" not found.';
        }
        
        // Create the email message 
        Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
        email.setTargetObjectId(opportunity.OwnerId);
        email.setSaveAsActivity(false);
        email.setSubject('Payment Request for: ' + opportunity.Name);
        String customerName = opportunity.Account.Name;
        String htmlBody = 'Dear ' + customerName + ',<br><br>' +
        'Click on the button below to make a payment for your recent purchase of ' + opportunity.Name + '.<br><br>' +
        '<a href="' + paymentURL + '" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px;">' +
        'Make Payment</a>'+'<br><br> Regards, <br><br> '+opportunity.Owner.Name;
        email.setHtmlBody(htmlBody);
        // Send the email
        try{
         Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{email});
          return 'Payment link email sent successfully.';
        }catch(Exception e){
            return 'Error Sending Email:'+ e.getMessage();
        }
                                                 
    }

    @AuraEnabled(cacheable=true)
    public static String createPrice(OpportunityLineItem product){
        String apiURL = baseURL+'/v1/prices';//Endpoint URL
        HttpRequest request = new HttpRequest();
        HttpResponse response = new HttpResponse();
        Http httpRequest = new Http();
        String requestBody = 'unit_amount_decimal='+EncodingUtil.urlEncode(String.valueOf(product.TotalPrice),'UTF-8')+
                              '&currency='+EncodingUtil.urlEncode('inr','UTF-8')+
                              '&product_data[name]='+EncodingUtil.urlEncode(product.Product2.Name,'UTF-8');        	
            System.debug('request body is ' + requestBody);
            request.setEndpoint(apiURL);
            request.setMethod('POST');
            request.setBody(requestBody);
            //Defining Headers For Authorization And Content Type
            request.setHeader('Authorization','Basic '+EncodingUtil.base64Encode(Blob.valueOf(secretKey+':' +publicKey)));
            request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
            response = httpRequest.send(request);
            //Verifying Status Code
            if(response.getStatusCode() == 200)
            { 
                return response.getBody();//Returning Response Body
            }
            else if (response.getStatusCode() != 200) {
				System.debug('Error response is ' + response);
                throw new AuraHandledException('Error Processing Payment From Apex');
            }
            return '';
    }
    @AuraEnabled(cacheable=true)
    public static String createPayementLink(){
        Integer lineItemIndex = 0;
        String requestBody = '';
        for (String productId : productDataMap.keySet()) {
            Map<String, Object> productInfo = productDataMap.get(productId);
            String responseId = (String)productInfo.get('responseId');
            Map<String, Object> productData = (Map<String, Object>)productInfo.get('productData');
            Integer quantity = Math.round((Double)productData.get('Quantity'));
           // Construct the line item string manually
             String lineItem = '&line_items[' + lineItemIndex + '][price]=' + EncodingUtil.urlEncode(responseId, 'UTF-8') + 
                     '&line_items[' + lineItemIndex + '][quantity]=' + quantity;
            lineItemIndex++;
            requestBody += lineItem;
        }
        String apiURL = baseURL+'/v1/payment_links';//Endpoint URL
        HttpRequest request = new HttpRequest();
        HttpResponse response = new HttpResponse();
        Http httpRequest = new Http();  	
            System.debug('request body is ' + requestBody);
            request.setEndpoint(apiURL);
            request.setMethod('POST');
            request.setBody(requestBody);
            //Defining Headers For Authorization And Content Type
            request.setHeader('Authorization','Basic '+EncodingUtil.base64Encode(Blob.valueOf(secretKey+':' +publicKey)));
            request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
            response = httpRequest.send(request);
            //Verifying Status Code
            if(response.getStatusCode() == 200)
            { 
                return response.getBody();//Returning Response Body
            }
            else if (response.getStatusCode() != 200) {
                throw new AuraHandledException('Error Processing Payment From Apex');
            }
            return '';
    }
}