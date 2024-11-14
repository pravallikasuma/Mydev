({
  refresh: function(component, event, helper) {
    this.LightningConfirm.open({
        message: "do you want to refresh the stock prices?",
      theme: "info",
      //  variant: "headerless",
      label: "Please Confirm"
    }).then(function(result) {
      // result is true if clicked "OK"
      // result is false if clicked "Cancel"
      console.log("confirm result is", result);
      if (result) {
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
              data[i].changesPercentage = data[i].changesPercentage.toFixed(2);
              data[i].format =
                data[i].changesPercentage < 0
                  ? "slds-text-color_error"
                  : "slds-text-color_success";
              data[i].earningsAnnouncement = data[i].earningsAnnouncement.split(
                "T"
              )[0];
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
  }
});