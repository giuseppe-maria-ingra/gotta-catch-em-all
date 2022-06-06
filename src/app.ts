/*!
 * Button demo.  Creates a button which, when clicked, will seem to change
 * the color of a horse.  Actually makes horses invisible / visible
 * to change the color.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';

/**
 * The main class of this app. All the logic goes here.
 */
export default class UpYourArsenal {

	private buttonAsset: MRE.AssetContainer;
	private pokeballAsset: MRE.AssetContainer;
	private button: MRE.Actor
	private text: MRE.Actor = null;

	//====================
	// Track which attachments belongs to which user
	// NOTE: The MRE.Guid will be the ID of the user.  Maps are more efficient with Guids for keys
	// than they would be with MRE.Users.
	//====================

	private attachments_pokeball = new Map<MRE.Guid, MRE.Actor>();

	/*
	 * constructor
	 */
	constructor(private context: MRE.Context) {

		this.context.onStarted(() => this.started());

		//====================
		// Set up a userLeft() callback
		//====================
		this.context.onUserLeft((user) => this.userLeft(user));
	}

	/**
	 * Once the context is "started", initialize the app.
	 */
	private started() {
		/*
		* set up somewhere to store loaded assets (meshes, textures,
		* animations, gltfs, etc.)
		*/
		this.buttonAsset = new MRE.AssetContainer(this.context);

		this.pokeballAsset = new MRE.AssetContainer(this.context);


		//======================
		// Create the button object.
		// It will be a simple box primitive.
		//======================
		this.button = MRE.Actor.CreatePrimitive(this.buttonAsset,
			{
				definition: { shape: MRE.PrimitiveShape.Box},
				actor: {
					transform: {
						local: {
							scale: { x: 0.6, y: 0.6, z: 0.6 }
						}
					},
					appearance: { enabled: true }
				},
				addCollider: true		/* Must have a collider for buttons. */
			}
		);

		// Create a new actor with no mesh, but some text.
		this.text = MRE.Actor.Create(this.context, {
			actor: {
				name: 'Text',
				transform: {
					app: { position: { x: 0, y: 0.5, z: 0 } }
				},
				text: {
					contents: "Click here if you wanna be the very best!",
					anchor: MRE.TextAnchorLocation.MiddleCenter,
					color: { r: 30 / 255, g: 206 / 255, b: 213 / 255 },
					height: 0.3
				}
			}
		});

		this.button.created().then(() =>
		this.button.setBehavior(MRE.ButtonBehavior).onClick((user) => this.getTrainerItems(user)));

		//=============================
		// Set up a userLeft() callback to clean up userTrackers as Users leave.
		//=============================
		this.context.onUserLeft((user) => this.userLeft(user));
	}

	private getTrainerItems(user: MRE.User) {
        const attachment_pokeball = MRE.Actor.CreateFromGltf(
			this.pokeballAsset,
            {
                uri: 'https://cdn-content-ingress.altvr.com/uploads/model/gltf/2000057431769481579/pokeball.glb',
                actor: {
                    attachment: {
                        attachPoint: 'right-hand',
                        userId: user.id
                    },
                    transform: {
                        local: {
                            scale: { x: 0.1, y: 0.1 , z: 0.1 }
                        }
                    }
                }
            }
        );

        this.attachments_pokeball.set(user.id, attachment_pokeball);

    }
	


	//====================
	// When a user leaves, remove the attachment (if any) and destroy it
	//====================
	private userLeft(user: MRE.User) {
		// See if the user has any attachments.
		if (this.attachments_pokeball.has(user.id)) {
			const attachment_pokeball = this.attachments_pokeball.get(user.id);

			// Detach the Actor from the user
			attachment_pokeball.detach();

			// Destroy the Actor.
			attachment_pokeball.destroy();

			// Remove the attachment from the 'attachments' map.
			this.attachments_pokeball.delete(user.id);
		}
	}
}
