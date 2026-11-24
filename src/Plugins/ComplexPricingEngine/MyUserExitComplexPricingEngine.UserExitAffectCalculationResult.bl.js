"use strict";

///////////////////////////////////////////////////////////////////////////////////////////////
//                 IMPORTANT - DO NOT MODIFY AUTO-GENERATED CODE OR COMMENTS                 //
//Parts of this file are auto-generated and modifications to those sections will be          //
//overwritten. You are allowed to modify:                                                    //
// - the tags in the jsDoc as described in the corresponding section                         //
// - the function name and its parameters                                                    //
// - the function body between the insertion ranges                                          //
//         "Add your customizing javaScript code below / above"                              //
//                                                                                           //
// NOTE:                                                                                     //
// - If you have created PRE and POST functions, they will be executed in the same order     //
//   as before.                                                                              //
// - If you have created a REPLACE to override core function, only the REPLACE function will //
//   be executed. PRE and POST functions will be executed in the same order as before.       //
//                                                                                           //
// - For new customizations, you can directly modify this file. There is no need to use the  //
//   PRE, POST, and REPLACE functions.                                                       //
//                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Use the following jsDoc tags to describe the BL function. Setting these tags will
 * change the runtime behavior in the mobile app. The values specified in the tags determine
 * the name of the contract file. The filename format is “@this . @function .bl.js”.
 * For example, LoVisit.BeforeLoadAsync.bl.js
 * -> function: Name of the businessLogic function.
 * -> this: The LO, BO, or LU object that this function belongs to (and it is part of the filename).
 * -> kind: Type of object this function belongs to. Most common value is "businessobject".
 * -> async: If declared as async then the function should return a promise.
 * -> param: List of parameters the function accepts. Make sure the parameters match the function signature.
 * -> module: Use CORE or CUSTOM. If you are a Salesforce client or an implementation partner, always use CUSTOM to enable a seamless release upgrade.
 * -> maxRuntime: Maximum time this function is allowed to run, takes integer value in ms. If the max time is exceeded, error is logged.
 * -> returns: Type and variable name in which the return value is stored.
 * @function UserExitAffectCalculationResult
 * @this ComplexPricingEngine
 * @kind plugin
 * @namespace CUSTOM
 * @param {Object} OrderAttributes
 * @param {Object} UserExitId
 * @param {Object} CurrentCalcStepAttributes
 * @param {Object} VariantAttributes
 * @param {Object} AffectableResults
 * @param {Object} ProductAttributes
 * @returns AffectedResults
 */
function UserExitAffectCalculationResult(OrderAttributes, UserExitId, CurrentCalcStepAttributes, VariantAttributes, AffectableResults, ProductAttributes){
    var me = this;
    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code below.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////

    /*
     * GASO IVA no cabeçalho - igual ao user exit do Salesforce ("User Exit Calculo VAT no Cabeçalho").
     * Passos GASO_VAT_BUCKET_<taxa> (Summation sobre o IVA da linha): se a classificação fiscal do produto
     * não for a taxa do bucket, o resultado do passo fica a 0. Os passos de cabeçalho somam cada bucket.
     */
    var AffectedResults = {};

    var gasoVatRates = {
        GASO_VAT_BUCKET_0: 0,
        GASO_VAT_BUCKET_6: 6,
        GASO_VAT_BUCKET_13: 13,
        GASO_VAT_BUCKET_23: 23
    };

    if (Object.prototype.hasOwnProperty.call(gasoVatRates, UserExitId)) {
        // O motor entrega os atributos do produto com os nomes do CndCpReadProductAttributes (TaxClassification)
        var item = Array.isArray(ProductAttributes) ? ProductAttributes[0] : ProductAttributes;
        var rawRate = item ? (item.TaxClassification !== undefined && item.TaxClassification !== null ? item.TaxClassification : item.taxClassification) : null;
        var appliedRate = (rawRate === null || typeof rawRate === "undefined" || String(rawRate).trim() === "") ? NaN : Number(rawRate);

        // Classificação fiscal vazia ou inválida: a linha conta como taxa 0
        if (!isFinite(appliedRate) || [0, 6, 13, 23].indexOf(appliedRate) === -1) {
            appliedRate = 0;
        }

        if (appliedRate !== gasoVatRates[UserExitId]) {
            AffectedResults.currentCalculationResult = 0;
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code above.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////

    return AffectedResults;
}
