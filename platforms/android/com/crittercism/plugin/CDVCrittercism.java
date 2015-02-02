package com.crittercism.plugin;

import java.net.URL;

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

    private String packageName;

    @Override
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);
        Context context = this.cordova.getActivity();
        packageName = context.getPackageName();
        Resources resources = context.getResources();
        String crAppID = context.getString(resources.getIdentifier(
                APPLICATION_ID, STRING, packageName));
        Crittercism.initialize(context, crAppID);
    }

    @Override
    public boolean execute(String action, final JSONArray args,
                           CallbackContext callbackContext) throws JSONException {
        try {
            if (ACTION_ADD_BREADCRUMB.equals(action)) {
                final String breadcrumb = args.getString(0);
                Crittercism.leaveBreadcrumb(breadcrumb);
                return true;
            } else if (ACTION_SET_USERNAME.equals(action)) {
                final String username = args.getString(0);
                cordova.getThreadPool().execute(new Runnable() {
                    public void run() {
                        Crittercism.setUsername(username);
                    }
                });
                return true;
            } else if (ACTION_SET_VALUE_FOR_KEY.equals(action)) {
                final String key = args.getString(0);
                final String value = args.getString(1);

                cordova.getThreadPool().execute(new Runnable() {
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
            } else if (ACTION_LOG_HANDLED_EXCEPTION.equals(action)) {
                final String name = args.getString(0);
                final String msg = args.getString(1);
                final String stack = args.getString(2);
                cordova.getThreadPool().execute(new Runnable() {
                    public void run() {
                        Crittercism._logHandledException(name, msg, stack);
                    }
                });
                return true;
            } else if (ACTION_LOG_CRASH_EXCEPTION.equals(action)) {
                final String msg = args.getString(0);
                final String stack = args.getString(1);
                cordova.getThreadPool().execute(new Runnable() {
                    public void run() {

                        Crittercism._logCrashException(msg, stack);
                    }
                });
                return true;
            } else if (ACTION_LOG_NETWORK_REQUEST.equals(action)) {
                // I don't believe manually logging network requests is meant to be supported.
                // It doesn't appear on the docs and should this be the case, we expect the
                // error value to be an 'int' between 600 and 604 than a user supplied string.
                final String method = args.getString(0);
                final URL url = new URL(args.getString(1));
                final long responseTime = args.getLong(2);
                final long bytesRead = args.getLong(3);
                final long bytesSent = args.getLong(4);
                final int responseCode = args.getInt(5);

                String errorString = null;
                final Exception error;

                if (!args.isNull(6)) {
                    try {
                        final int errorInt = args.getInt(6);
                        errorString = Integer.toString(errorInt);
                    } catch (Throwable t) {}

                    if (errorString == null) {
                        try {
                            String tmpErrorString = args.getString(6);
                            // Make sure the string parses to a valid integer
                            Integer integer = Integer.valueOf(tmpErrorString);
                            errorString = integer.toString();
                        } catch (JSONException ignored) {
                        } catch (NumberFormatException ignored) { }
                    }
                }

                if (errorString != null) {
                    error = new CRXMLHttpRequestException(errorString);
                } else {
                    error = null;
                }

                cordova.getThreadPool().execute(new Runnable() {
                    @Override
                    public void run() {
                        Crittercism.logNetworkRequest(method, url, responseTime, bytesRead, bytesSent, responseCode, error);
                    }
                });
                return true;
            } else if (ACTION_BEGIN_TRANSACTION.equals(action)) {
                final String transaction = args.getString(0);

                cordova.getThreadPool().execute(new Runnable() {
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
            } else if (ACTION_END_TRANSACTION.equals(action)) {
                final String transaction = args.getString(0);
                cordova.getThreadPool().execute(new Runnable() {
                    @Override
                    public void run() {
                        Crittercism.endTransaction(transaction);
                    }
                });
                return true;
            } else if (ACTION_FAIL_TRANSACTION.equals(action)) {
                final String transaction = args.getString(0);
                cordova.getThreadPool().execute(new Runnable() {
                    @Override
                    public void run() {
                        Crittercism.failTransaction(transaction);
                    }
                });
                return true;
            } else if (ACTION_SET_TRANSACTION_VALUE.equals(action)) {
                final String transaction = args.getString(0);
                final int transactionValue = args.getInt(1);
                cordova.getThreadPool().execute(new Runnable() {
                    @Override
                    public void run() {
                        Crittercism.setTransactionValue(transaction, transactionValue);
                    }
                });
                return true;
            } else if (ACTION_GET_TRANSACTION_VALUE.equals(action)) {
                // Executing task in foreground so that call is faster given the user may expect a synchronous response
                final String transaction = args.getString(0);
                final int transactionValue = Crittercism.getTransactionValue(transaction);
                callbackContext.sendPluginResult(new PluginResult(Status.OK, transactionValue));
                return true;
            }

            return false;
        } catch (ThreadDeath td) {
            throw td;
        } catch (Throwable t) {
            Crittercism.logHandledException(t);
            return false;
        }
    }
}
