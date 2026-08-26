const fs = require('fs');
let code = fs.readFileSync('src/components/NewsletterForm.tsx', 'utf8');

const old = `            )}
            
            )}
          </div>
        </div>
      )}
    </>
  );
}`;

const rep = `            )}
          </div>
        </div>
      )}
    </>
  );
}`;

code = code.replace(old, rep);
fs.writeFileSync('src/components/NewsletterForm.tsx', code);
