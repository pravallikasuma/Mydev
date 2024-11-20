import { LightningElement ,api,wire,track} from 'lwc';
import LightningConfirm from 'lightning/confirm';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getStockDetails from '@salesforce/apex/stockpriceFetch.getStockDetails';

const columns = [
      { label: "Stock", fieldName: "symbol", hideDefaultActions: true },
      { label: "Price", fieldName: "price", hideDefaultActions: true },
      { label: "% change", fieldName: "changesPercentage", hideDefaultActions: true,cellAttributes: {
          class: {
              fieldName: 'format'
          },
          alignment: 'left'
      }
},
    { label: "Market Cap", fieldName: "marketCap", hideDefaultActions: true },
    {
      label: "earningsAnnouncement",
      fieldName: "earningsAnnouncement",
      hideDefaultActions: true
    },
    { label: "PE", fieldName: "pe" }
    //   { label: "General Ledger",fieldName: "promgt__GeneralLedger__c", hideDefaultActions: true,editable: true  },
  ];
export default class FetchStocksLWC extends LightningElement {
    columns = columns;    
    @track ListofObj = [];
    async handleConfirmClick() {
        const result = await LightningConfirm.open({
            message: 'do you want to refresh the stock prices?',
            theme: "info",
            label: 'Please Confirm',
        });
        //Confirm has been closed
        //result is true if OK was clicked
        if(result){
            getStockDetails({
            })
                .then((res) => {
                    if (res != null && typeof res !== 'undefined') {
                    const dataList = JSON.parse(JSON.stringify(res));
    
                    for (let i = 0; i < res.length; i++) {
                        res[i].changesPercentage = res[i].changesPercentage.toFixed(2);
                        res[i].format =
                          res[i].changesPercentage < 0
                            ? "slds-text-color_error"
                            : "slds-text-color_success";
                        res[i].earningsAnnouncement = res[i].earningsAnnouncement.split(
                          "T"
                        )[0];
                    }
        this.ListofObj = res;
                        
                            
                            const evt = new ShowToastEvent({
                                title: 'Success',
                                message: 'stock prices updated successfully!!',
                                variant: "success"
                              });
                              this.dispatchEvent(evt);
                          
                        
    
                    }
                })
                .catch(error => {
                    this.showErrorToast(error, this);
                });
    
        }
        //and false if cancel was clicked
    }

}