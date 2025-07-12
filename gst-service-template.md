# invoice_template


```json
{
    "invoice_template": 
    {
        "invoice_id": "string",
        "gstin": "string",
        "date": "YYYY-MM-DD",
        "amount": "number",
        "tax": {
            "cgst": "number",
            "sgst": "number",
            "igst": "number"
            },
        "state": "string",
        "vendor_type": "string",
        "buyer_type": "string",
        "products": [
        {
            "sku": "string",
            "product_name": "string",
            "category": "string",
            "unit_price": "number",
            "quantity": "number",
            "discount_percent": "number",
            "price_after_discount": "number",
            "tax": {
            "cgst": "number",
            "sgst": "number",
            "igst": "number"
            },
            "supplier_payment_status": "PAID|UNPAID|PARTIALLY_PAID",
            "remaining_supplier_amount": "number (mandatory)",
            "buying_price": "number"
        }
        ],
        "status": "PAID|PARTIALLY_PAID|CANCELLED|RETURNED|REFUNDED",
        "payment_status": "COMPLETED|PARTIAL|NOTPAID|REFUNDED|ON_HOLD",
        "amount_paid": "number"
    }
}

```


# field_definitions


```json

{
    "field_definitions": 
    {
        "invoice_id": {
            "type": "string",
            "not null / mandatory": true,
            "format": "Alphanumeric identifier incremented by 1 for each invoice",
            "example": "INV001"
        },
        "gstin": {
            "type": "string",
            "not null / mandatory": true,
            "format": "15-character GST identification number"
        },
        "date": {
            "type": "string",
            "not null / mandatory": true,
            "format": "(YYYY-MM-DD)"
        },
        "amount": {
            "type": "number",
            "not null / mandatory": true
        },
        "tax": {
            "type": "object",
            "not null / mandatory": true,
            "properties": {
                "cgst": "number",
                "sgst": "number",
                "igst": "number"
            }
        },
        "state": {
            "type": "string",
            "not null / mandatory": true
        },
        "vendor_type": {
            "type": "string",
            "not null / mandatory": true,
            "enum": [
                "wholesellers",
                "retailers",
                "manufacturers",
                "distributors"
            ]
        },
        "buyer_type": {
            "type": "string",
            "not null / mandatory": false,
            "enum": [
                "consumer",
                "business",
                "government",
                "reseller"
            ]
        },
        "products": {
            "type": "array",
            "not null / mandatory": true,
            "min_items": 1
        },
        "status": {
            "type": "string",
            "not null / mandatory": true,
            "enum": [
                "PAID",
                "NOTPAID",
                "PARTIALLY_PAID",
                "CANCELLED",
                "RETURNED",
                "REFUNDED"
            ]
        },
        "payment_status": {
            "type": "string",
            "not null / mandatory": true,
            "enum": [
                "REFUNDED",
                "PARTIAL",
                "NOTPAID",
                "COMPLETED",
                "ON_HOLD"
            ]
        },
        "amount_paid": {
            "type": "number",
            "not null / mandatory": true
        }
    }
}

```


# product_schema


```json

{
    "product_schema": 
    {
        "sku": {
            "type": "string",
            "not null / mandatory": true
        },
        "product_name": {
            "type": "string",
            "not null / mandatory": true
        },
        "category": {
            "type": "string",
            "not null / mandatory": true
        },
        "unit_price": {
            "type": "number",
            "not null / mandatory": true
        },
        "quantity": {
            "type": "number",
            "not null / mandatory": true,
            "minimum": 1
        },
        "discount_percent": {
            "type": "number",
            "not null / mandatory": false,
            "minimum": 0,
            "maximum": 100
        },
        "price_after_discount": {
            "type": "number",
            "not null / mandatory": true
        },
        "tax": {
            "type": "object",
            "not null / mandatory": true
        },
        "supplier_payment_status": {
            "type": "string",
            "not null / mandatory": true,
            "enum": [
                "PAID",
                "NOTPAID",
                "PARTIALLY_PAID"
            ]
        },
        "remaining_supplier_amount": {
            "type": "number",
            "not null / mandatory": true
        },
        "buying_price": {
            "type": "number",
            "not null / mandatory": true
        }
  }
}

```




# enum_combinations_validations


## status :: payment_status_combinations


```json
{
    "status :: payment_status_combinations": [
      {
        "status": "PAID",
        "payment_status": "COMPLETED",
        "amount_paid": "equals amount"
      },
      {
        "status": "NOTPAID",
        "payment_status": "NOTPAID",
        "amount_paid": "0"
      },
      {
        "status": "PARTIALLY_PAID",
        "payment_status": "PARTIAL",
        "amount_paid": "30-90% of amount"
      },
      {
        "status": "CANCELLED",
        "payment_status": "NOTPAID",
        "amount_paid": 0,
        "condition": "when suppliers are UNPAID"
      },
      {
        "status": "CANCELLED",
        "payment_status": "REFUNDED",
        "amount_paid": "equals amount",
        "condition": "when suppliers are PAID"
      },
      {
        "status": "RETURNED",
        "payment_status": "REFUNDED",
        "amount_paid": "equals amount"
      },
      {
        "status": "RETURNED",
        "payment_status": "ON_HOLD",
        "amount_paid": "equals amount"
      },
      {
        "status": "REFUNDED",
        "payment_status": "REFUNDED",
        "amount_paid": "equals amount"
      }
    ]
}


```



## supplier_payment_status :: remaining_amount_combinations

```json

{
    "supplier_payment_status :: remaining_amount_combinations": [
      {
        "supplier_payment_status": "PAID",
        "remaining_supplier_amount": 0
      },
      {
        "supplier_payment_status": "NOTPAID",
        "remaining_supplier_amount": "> 0"
      },
      {
        "supplier_payment_status": "PARTIALLY_PAID",
        "remaining_supplier_amount": "> 0"
      }
    ]
}

```




## payment_status :: amount_paid_combinations

```json

{
    "payment_status :: amount_paid_combinations": [
      {
        "payment_status": "COMPLETED",
        "amount_paid": "equals amount"
      },
      {
        "payment_status": "PARTIAL",
        "amount_paid": "0 < amount_paid < amount"
      },
      {
        "payment_status": "NOTPAID",
        "amount_paid": 0
      },
      {
        "payment_status": "REFUNDED",
        "amount_paid": "equals amount"
      },
      {
        "payment_status": "ON_HOLD",
        "amount_paid": "equals amount"
      }
    ]
}

```



# Expected response sample

```json

{
    "expected_response_sample": {
    "invoice_id": "INV001",
    "gstin": "29ABCDE1234F2Z5",
    "date": "2024-01-15",
    "amount": 12250,
    "tax": {
      "cgst": 935,
      "sgst": 935,
      "igst": 0
    },
    "state": "Karnataka",
    "vendor_type": "wholesellers",
    "buyer_type": "consumer",
    "products": [
      {
        "sku": "ELEC006",
        "product_name": "Wireless Mouse",
        "category": "Electronics",
        "unit_price": 900,
        "quantity": 1,
        "discount_percent": 5,
        "price_after_discount": 855,
        "tax": {
          "cgst": 77,
          "sgst": 77,
          "igst": 0
        },
        "supplier_payment_status": "PAID",
        "buying_price": 765
      },
      {
        "sku": "TOOL014",
        "product_name": "Drill Machine",
        "category": "Tools",
        "unit_price": 3500,
        "quantity": 1,
        "discount_percent": 10,
        "price_after_discount": 3150,
        "tax": {
          "cgst": 284,
          "sgst": 284,
          "igst": 0
        },
        "supplier_payment_status": "PAID",
        "buying_price": 2975
      },
      {
        "sku": "KITCH008",
        "product_name": "Frying Pan Set",
        "category": "Kitchenware",
        "unit_price": 2500,
        "quantity": 3,
        "discount_percent": 15,
        "price_after_discount": 6375,
        "tax": {
          "cgst": 574,
          "sgst": 574,
          "igst": 0
        },
        "supplier_payment_status": "UNPAID",
        "remaining_supplier_amount": 1401,
        "buying_price": 2125
      }
    ],
    "status": "PARTIALLY_PAID",
    "payment_status": "PARTIAL",
    "amount_paid": 6503
  }
}

```