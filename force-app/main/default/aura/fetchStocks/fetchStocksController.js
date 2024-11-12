({
  initJSONData: function(component, event, helper) {
    const COLUMNS = [
      //       { label: "Status", fieldName: "promgt__Status__c", hideDefaultActions: true,},
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
    component.set("v.Manual", COLUMNS);
  },
  refresh: function(component, event, helper) {
    var action = component.get("c.getStockDetails"); // Apex method to fetch data
    action.setCallback(this, function(response) {
      if (response.getState() === "SUCCESS") {
        var data = response.getReturnValue();
        console.log("data-->", data);
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
          title: "Success!",
          type: "success",
          message: "Stock prices Updated Successfully!!"
        });
        toastEvent.fire();
        for (let i = 0; i < data.length; i++) {
            data[i].changesPercentage= data[i].changesPercentage.toFixed(2);
            data[i].format = data[i].changesPercentage < 0 ? 'slds-text-color_error' : 'slds-text-color_success';
          data[i].earningsAnnouncement = data[i].earningsAnnouncement.split("T")[0];
        }
        component.set("v.dataManual", data);
      } else if (state === "ERROR") {
        // Handle error
        var errors = response.getError();
        if (errors && errors.length > 0) {
          console.error("Error:", errors[0].message);
        } else {
          console.error("Unknown error");
        }
      }
    });
    $A.enqueueAction(action);
  }
});