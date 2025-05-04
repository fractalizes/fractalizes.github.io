class Start extends Scene {

    create() {
    
        this.engine.setTitle(this.engine.storyData.Title); // TODO: replace this text using this.engine.storyData to find the story title
        this.engine.addChoice("Begin the Story");

        // initialize variables
        this.engine.wallet = false;
        this.engine.ingredients = [false, false, false];
    
    }

    handleChoice() {
    
        this.engine.gotoScene(Location, this.engine.storyData.InitialLocation); // TODO: replace this text by the initial location of the story
    
    }
}

class Location extends Scene {

    create(key) {

        let locationData = this.engine.storyData.Locations[key];

        if (key == "Supermarket") {
            
            // check if player has collected wallet
            if (this.engine.wallet) {

                let collectedLocal = true;
                
                // check if all ingredients were collected
                for (let i = 0; i < 3; i++) {

                    if (!this.engine.ingredients[i]) {

                        collectedLocal = false;
                        break;

                    }

                }

                // update index counter
                let i = 0;

                this.engine.show(collectedLocal ? "Great! You now have everything to make your sandwich." : locationData.Body);
                
                for (let choice of locationData.Choices) {

                    if ((collectedLocal && i == 3) || (!collectedLocal && !this.engine.ingredients[i] && i < 3)) {
                    
                        this.engine.addChoice(choice.Text, choice);

                    }

                    i++;

                }

            }

            else {

                let i = 0;

                this.engine.show("As you arrive to the supermarket, you frantically run towards the bakery section for bread. When you grab your slightly expired bread and reach for your wallet to make your purchase, it's gone! You must have forgotten your wallet in the pantry, rats!");

                for (let choice of locationData.Choices) {

                    if (i == 3) {

                        this.engine.addChoice(choice.Text, choice);

                    }

                    i++;

                }

            }

        }

        else if (locationData.Choices.length > 0) {

            this.engine.show(locationData.Body);
            
            if (key == "Pantry") {

                // mark wallet as collected
                this.engine.wallet = true;
    
            }

            else if (key == "Bakery") {

                // mark bread as collected
                this.engine.ingredients[0] = true;
    
            }
            
            else if (key == "Cut Line") {

                // mark ham as collected
                this.engine.ingredients[1] = true;
    
            }

            else if (key == "Shopping Cart" ) {

                // mark lettuce as collected
                this.engine.ingredients[2] = true;

            }
            
            for (let choice of locationData.Choices) {

                this.engine.addChoice(choice.Text, choice);

            }

        }
        
        else {
            
            this.engine.show(locationData.Body);
            this.engine.addChoice("The end!")
        
        }
    
    }

    handleChoice(choice) {
    
        if (choice) {
        
            this.engine.show("&gt; "+choice.Text);
            this.engine.gotoScene(Location, choice.Target);
        
        }

        else {
        
            this.engine.gotoScene(End);
        
        }
    
    }

}

class End extends Scene {

    create() {
    
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits);
    
    }

}

Engine.load(Start, 'myStory.json');