
'use strict';
import * as net from 'net';
import { XMLHttpRequest } from 'xmlhttprequest-ts';
import { workspace, commands, ExtensionContext, window, ViewColumn, env, Uri} from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, StreamInfo, DynamicFeature, ClientCapabilities, DocumentSelector, InitializeParams, RegistrationData, RPCMessageType, ServerCapabilities, VersionedTextDocumentIdentifier } from 'vscode-languageclient';

var client: LanguageClient = null;

async function configureAndStartClient(context: ExtensionContext) {
        // Startup options for the language server
        const settings = workspace.getConfiguration("Webapp");
        const lspTransport = settings.get("lspTransport");  
        let script = 'java';
		let arg1 = context.asAbsolutePath("..\\resources\\inferIDE-0.0.1.jar -s");
        let args = ['-jar', arg1];
    
        const serverOptionsStdio = {
            run: { command: script, args: args },
            debug: { command: script, args: args }
        }
    
        const serverOptionsSocket = () => {
            const socket = net.connect({ port: 5007 })
			 const result: StreamInfo = {
                writer: socket,
                reader: socket
            }
		 return new Promise<StreamInfo>((resolve) => {
                socket.on("connect", () => 
					resolve(result))
              socket.on("error", _ => {
					
                    window.showErrorMessage(
                        "Failed to connect to language server. Make sure that the language server is running " +
                        "-or- configure the extension to connect via standard IO.", "Open settings", "Reconnect")
                        .then( function( str ){
                             if( str.startsWith("Open") ){
								
                                commands.executeCommand('workbench.action.openSettings', '@ext:' + context.extensionPath);
                             }
							 else if(str.startsWith("Reconnect")){
                                configureAndStartClient(context);
                             }
                        });
                    client = null;
                });
            })
        }
		
    const serverOptions: ServerOptions =
		(lspTransport === "stdio") ? serverOptionsStdio : (lspTransport === "socket") ? serverOptionsSocket : null

	let clientOptions: LanguageClientOptions = {
		documentSelector: [{ scheme: 'file', language: 'java' }],
		synchronize: {
			configurationSection: 'java',
			fileEvents: [workspace.createFileSystemWatcher('**/*.java')]
		}
	};

    
   	// Create the language client and start the client.
	client = new LanguageClient('Webapp', 'Webapp', serverOptions, clientOptions); 
	//register showHTML feature 
	client.registerFeature(new SupportsShowHTML(client));
	client.start();
	
	await client.onReady();
}

export class SupportsShowHTML implements DynamicFeature<undefined> {
	
	constructor(private _client: LanguageClient) {
		
    }

	messages: RPCMessageType | RPCMessageType[];
	fillInitializeParams?: (params: InitializeParams) => void;
	fillClientCapabilities(capabilities: ClientCapabilities): void {
		capabilities.experimental = {
			supportsShowHTML: true, 
		}
	}

	initialize(capabilities: ServerCapabilities<any>, documentSelector: DocumentSelector): void {
	
		let client = this._client;
		
		const panel = window.createWebviewPanel("Web Page", "MagpieBridge Web Page",ViewColumn.One,{
			enableScripts: true 
		});
        client.onNotification("magpiebridge/showHTML",(content: string)=>{	
			
			 panel.webview.html = content;
			
			})
	}

	register(message: RPCMessageType, data: RegistrationData<undefined>): void {

	}
	unregister(id: string): void {

	}
	dispose(): void {

	}

}



export async function activate(context: ExtensionContext) {
	configureAndStartClient(context);
	var panel;
	workspace.onDidChangeConfiguration(e => {
		if (client)
			client.stop().then(() => configureAndStartClient(context));
		else
			configureAndStartClient(context)
	})
}

