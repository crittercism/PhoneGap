//  Copyright 2014 Crittercism
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.

package com.crittercism.plugin;

import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.PluginResult;
import org.apache.cordova.PluginResult.Status;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.content.res.Resources;

import com.crittercism.app.Crittercism;
import com.crittercism.error.CRXMLHttpRequestException;

public class CDVCrittercism extends CordovaPlugin {
    public static final String ACTION_INIT = "crittercismInit";
    public static final String ACTION_ADD_BREADCRUMB = "crittercismLeaveBreadcrumb";
    public static final String ACTION_SET_USERNAME = "crittercismSetUsername";
    public static final String ACTION_SET_VALUE_FOR_KEY = "crittercismSetValueForKey";
    public static final String ACTION_LOG_HANDLED_EXCEPTION = "crittercismLogHandledException";
    public static final String ACTION_LOG_CRASH_EXCEPTION = "crittercismLogUnhandledException";
    public static final String ACTION_LOG_NETWORK_REQUEST = "crittercismLogNetworkRequest";
    public static final String ACTION_BEGIN_TRANSACTION = "crittercismBeginTransaction";
    public static final String ACTION_END_TRANSACTION = "crittercismEndTransaction";
    public static final String ACTION_FAIL_TRANSACTION = "crittercismFailTransaction";
    public static final String ACTION_SET_TRANSACTION_VALUE = "crittercismSetTransactionValue";
    public static final String ACTION_GET_TRANSACTION_VALUE = "crittercismGetTransactionValue";

    public static final String APPLICATION_ID = "cr_app_id";
    public static final String STRING = "string";

    private ExecutorService executor = Executors.newSingleThreadExecutor();
    private String packageName;

    @Override
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);
    }

    @Override
    public boolean execute(String action, final JSONArray args,
                           CallbackContext callbackContext) throws JSONException {
        try {
            if (ACTION_INIT.equals(action)) {
                return executeInit(action, args, callbackContext);
            } else if (ACTION_ADD_BREADCRUMB.equals(action)) {
                return executeLeaveBreadcrumb(action, args, callbackContext);
            } else if (ACTION_SET_USERNAME.equals(action)) {
                return executeSetUsername(action, args, callbackContext);
            } else if (ACTION_SET_VALUE_FOR_KEY.equals(action)) {
                return executeSetMetadata(action, args, callbackContext);
            } else if (ACTION_LOG_HANDLED_EXCEPTION.equals(action)) {
                return executeLogHandledException(action, args, callbackContext);
            } else if (ACTION_LOG_CRASH_EXCEPTION.equals(action)) {
                return executeLogCrashException(action, args, callbackContext);
            } else if (ACTION_LOG_NETWORK_REQUEST.equals(action)) {
                return executeLogNetworkRequest(action, args, callbackContext);
            } else if (ACTION_BEGIN_TRANSACTION.equals(action)) {
                return executeBeginTransaction(action, args, callbackContext);
            } else if (ACTION_END_TRANSACTION.equals(action)) {
                return executeEndTransaction(action, args, callbackContext);
            } else if (ACTION_FAIL_TRANSACTION.equals(action)) {
                return executeFailTransaction(action, args, callbackContext);
            } else if (ACTION_SET_TRANSACTION_VALUE.equals(action)) {
                return executeSetTransactionValue(action, args, callbackContext);
            } else if (ACTION_GET_TRANSACTION_VALUE.equals(action)) {
                return executeGetTransactionValue(action, args, callbackContext);
            }
            return false;
        } catch (ThreadDeath td) {
            throw td;
        } catch (Throwable t) {
            Crittercism.logHandledException(t);
            return false;
        }
    }

    private boolean executeInit(String action, final JSONArray args,
                               CallbackContext callbackContext) throws JSONException {
        final JSONObject argsDict = args.getJSONObject(0);
        final String appID = argsDict.getString("androidAppID");
        final Context context = this.cordova.getActivity();
        executor.execute(new Runnable() {
            @Override
            public void run() {
                Crittercism.initialize(context, appID);
            }
        });
        return true;
    }
    
    private boolean executeLeaveBreadcrumb(String action, final JSONArray args,
                               CallbackContext callbackContext) throws JSONException {
        final String breadcrumb = args.getString(0);
        executor.execute(new Runnable() {
            @Override
            public void run() {
                Crittercism.leaveBreadcrumb(breadcrumb);
            }
        });
        return true;
    }

    private boolean executeSetUsername(String action, final JSONArray args,
                               CallbackContext callbackContext) throws JSONException {
        final String username = args.getString(0);
        executor.execute(new Runnable() {
            @Override
            public void run() {
                Crittercism.setUsername(username);
            }
        });
        return true;
    }

    private boolean executeSetMetadata(String action, final JSONArray args,
                               CallbackContext callbackContext) throws JSONException {
        final String key = args.getString(0);
        final String value = args.getString(1);
        executor.execute(new Runnable() {
            @Override
            public void run() {
                JSONObject metadata = new JSONObject();
                try {
                    metadata.put(key, value);
                } catch (JSONException e) {
                    Crittercism.logHandledException(e);
                }
                Crittercism.setMetadata(metadata);
            }
        });
        return true;
    }

    private boolean executeLogHandledException(String action, final JSONArray args,
                               CallbackContext callbackContext) throws JSONException {
        final String name = args.getString(0);
        final String msg = args.getString(1);
        final String stack = args.getString(2);
        executor.execute(new Runnable() {
            @Override
            public void run() {
                Crittercism._logHandledException(name, msg, stack);
            }
        });
        return true;
    }

    private boolean executeLogCrashException(String action, final JSONArray args,
                               CallbackContext callbackContext) throws JSONException {
        final String msg = args.getString(0);
        final String stack = args.getString(1);
        executor.execute(new Runnable() {
            @Override
            public void run() {
                Crittercism._logCrashException(msg, stack);
            }
        });
        return true;
    }

    private boolean executeLogNetworkRequest(String action, final JSONArray args,
                               CallbackContext callbackContext) throws JSONException {
        // I don't believe manually logging network requests is meant to be supported.
        // It doesn't appear on the docs and should this be the case, we expect the
        // error value to be an 'int' between 600 and 604 than a user supplied string.
        final String method = args.getString(0);
        final String urlStr = args.getString(1);
        final long responseTime = args.getLong(2);
        final long bytesRead = args.getLong(3);
        final long bytesSent = args.getLong(4);
        final int responseCode = args.getInt(5);
        int errorCode = 0;
        if (!args.isNull(6)) {
            errorCode = args.getInt(6);
        };
        final int finalErrorCode = errorCode; // Keep the compiler happy.
        executor.execute(new Runnable() {
            @Override
            public void run() {
                Crittercism.logNetworkRequest(method, urlStr, responseTime, bytesRead, bytesSent, responseCode, finalErrorCode);
            }
        });
        return true;
    }

    private boolean executeBeginTransaction(String action, final JSONArray args,
                               CallbackContext callbackContext) throws JSONException {
        final String transaction = args.getString(0);
        executor.execute(new Runnable() {
            @Override
            public void run() {
                Crittercism.beginTransaction(transaction);
                if (args.length() >= 2) {
                    try {
                        final int transactionValue = args.getInt(1);
                        Crittercism.setTransactionValue(transaction, transactionValue);
                    } catch (JSONException e) {}
                }
            }
        });
        return true;
    }

    private boolean executeEndTransaction(String action, final JSONArray args,
                               CallbackContext callbackContext) throws JSONException {
        final String transaction = args.getString(0);
        executor.execute(new Runnable() {
            @Override
            public void run() {
                Crittercism.endTransaction(transaction);
            }
        });
        return true;
    }

    private boolean executeFailTransaction(String action, final JSONArray args,
                               CallbackContext callbackContext) throws JSONException {
        final String transaction = args.getString(0);
        executor.execute(new Runnable() {
            @Override
            public void run() {
                Crittercism.failTransaction(transaction);
            }
        });
        return true;
    }

    private boolean executeSetTransactionValue(String action, final JSONArray args,
                               CallbackContext callbackContext) throws JSONException {
        final String transaction = args.getString(0);
        final int transactionValue = args.getInt(1);
        executor.execute(new Runnable() {
            @Override
            public void run() {
                Crittercism.setTransactionValue(transaction, transactionValue);
            }
        });
        return true;
    }

    private boolean executeGetTransactionValue(String action, final JSONArray args,
                               CallbackContext callbackContext) throws JSONException {
        // Executing task in foreground so that call is faster given the user may expect a synchronous response
        final String transaction = args.getString(0);
        final int transactionValue = Crittercism.getTransactionValue(transaction);
        callbackContext.sendPluginResult(new PluginResult(Status.OK, transactionValue));
        return true;
    }
}
