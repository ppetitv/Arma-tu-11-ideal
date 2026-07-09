(function attachDreamTeamData(windowObject) {
    windowObject.DreamTeamData = {
        storageKey: 'xi_ideal_2026',
        defaultFormation: '4-3-3',
        positionNames: {
            GK: 'Portero',
            DEF: 'Defensa',
            MID: 'Mediocampista',
            FWD: 'Delantero',
        },
        summaryTitles: {
            GK: 'Portero',
            DEF: 'Defensas',
            MID: 'Mediocampo',
            FWD: 'Ataque',
        },
        formations: {
            '4-3-3': [
                { pos: 'GK', count: 1, labels: ['PO'] },
                { pos: 'DEF', count: 4, labels: ['LI', 'DC', 'DC', 'LD'] },
                { pos: 'MID', count: 3, labels: ['MCD', 'MCP', 'MCP'] },
                { pos: 'FWD', count: 3, labels: ['EI', 'DC', 'ED'] },
            ],
            '4-4-2': [
                { pos: 'GK', count: 1, labels: ['PO'] },
                { pos: 'DEF', count: 4, labels: ['LI', 'DC', 'DC', 'LD'] },
                { pos: 'MID', count: 4, labels: ['MI', 'MCD', 'MCD', 'MD'] },
                { pos: 'FWD', count: 2, labels: ['DC', 'DC'] },
            ],
            '3-5-2': [
                { pos: 'GK', count: 1, labels: ['PO'] },
                { pos: 'DEF', count: 3, labels: ['DC', 'DC', 'DC'] },
                { pos: 'MID', count: 5, labels: ['CI', 'MCD', 'MCP', 'MCD', 'CD'] },
                { pos: 'FWD', count: 2, labels: ['DC', 'DC'] },
            ],
            '3-4-3': [
                { pos: 'GK', count: 1, labels: ['PO'] },
                { pos: 'DEF', count: 3, labels: ['DC', 'DC', 'DC'] },
                { pos: 'MID', count: 4, labels: ['CI', 'MCD', 'MCD', 'CD'] },
                { pos: 'FWD', count: 3, labels: ['EI', 'DC', 'ED'] },
            ],
        },
        teams: {
            'Argentina': { flag: 'linear-gradient(0deg, #75AADB 33%, #FFFFFF 33%, #FFFFFF 66%, #75AADB 66%)', players: [
                { id: 'ar_1', name: 'E. Martinez', pos: 'GK', number: 23, color: '#75AADB' }, { id: 'ar_2', name: 'N. Molina', pos: 'DEF', number: 4, color: '#75AADB' }, { id: 'ar_3', name: 'C. Romero', pos: 'DEF', number: 13, color: '#75AADB' }, { id: 'ar_4', name: 'L. Martinez', pos: 'DEF', number: 6, color: '#75AADB' }, { id: 'ar_5', name: 'N. Tagliafico', pos: 'DEF', number: 3, color: '#75AADB' }, { id: 'ar_6', name: 'R. De Paul', pos: 'MID', number: 7, color: '#75AADB' }, { id: 'ar_7', name: 'E. Fernandez', pos: 'MID', number: 24, color: '#75AADB' }, { id: 'ar_8', name: 'A. Mac Allister', pos: 'MID', number: 20, color: '#75AADB' }, { id: 'ar_9', name: 'L. Messi', pos: 'FWD', number: 10, color: '#75AADB' }, { id: 'ar_10', name: 'J. Alvarez', pos: 'FWD', number: 9, color: '#75AADB' }, { id: 'ar_11', name: 'A. Di Maria', pos: 'FWD', number: 11, color: '#75AADB' },
            ] },
            'Brasil': { flag: 'linear-gradient(45deg, #009C3B 50%, #FFDF00 50%)', players: [
                { id: 'br_1', name: 'Alisson', pos: 'GK', number: 1, color: '#009C3B' }, { id: 'br_2', name: 'Danilo', pos: 'DEF', number: 2, color: '#009C3B' }, { id: 'br_3', name: 'Marquinhos', pos: 'DEF', number: 4, color: '#009C3B' }, { id: 'br_4', name: 'Eder Militao', pos: 'DEF', number: 3, color: '#009C3B' }, { id: 'br_5', name: 'G. Arana', pos: 'DEF', number: 6, color: '#009C3B' }, { id: 'br_6', name: 'Casemiro', pos: 'MID', number: 5, color: '#009C3B' }, { id: 'br_7', name: 'B. Guimaraes', pos: 'MID', number: 8, color: '#009C3B' }, { id: 'br_8', name: 'L. Paqueta', pos: 'MID', number: 7, color: '#009C3B' }, { id: 'br_9', name: 'Vinicius Jr', pos: 'FWD', number: 11, color: '#009C3B' }, { id: 'br_10', name: 'Rodrygo', pos: 'FWD', number: 10, color: '#009C3B' }, { id: 'br_11', name: 'Raphinha', pos: 'FWD', number: 19, color: '#009C3B' },
            ] },
            'Francia': { flag: 'linear-gradient(90deg, #0055A4 33%, #FFFFFF 33%, #FFFFFF 66%, #EF4135 66%)', players: [
                { id: 'fr_1', name: 'Maignan', pos: 'GK', number: 16, color: '#0055A4' }, { id: 'fr_2', name: 'J. Kounde', pos: 'DEF', number: 5, color: '#0055A4' }, { id: 'fr_3', name: 'D. Upamecano', pos: 'DEF', number: 4, color: '#0055A4' }, { id: 'fr_4', name: 'I. Konate', pos: 'DEF', number: 17, color: '#0055A4' }, { id: 'fr_5', name: 'T. Hernandez', pos: 'DEF', number: 22, color: '#0055A4' }, { id: 'fr_6', name: 'A. Tchouameni', pos: 'MID', number: 8, color: '#0055A4' }, { id: 'fr_7', name: 'E. Camavinga', pos: 'MID', number: 6, color: '#0055A4' }, { id: 'fr_8', name: 'A. Griezmann', pos: 'MID', number: 7, color: '#0055A4' }, { id: 'fr_9', name: 'K. Mbappe', pos: 'FWD', number: 10, color: '#0055A4' }, { id: 'fr_10', name: 'O. Dembele', pos: 'FWD', number: 11, color: '#0055A4' }, { id: 'fr_11', name: 'M. Thuram', pos: 'FWD', number: 9, color: '#0055A4' },
            ] },
            'Espana': { flag: 'linear-gradient(0deg, #AA151B 25%, #F1BF00 25%, #F1BF00 75%, #AA151B 75%)', players: [
                { id: 'es_1', name: 'Unai Simon', pos: 'GK', number: 23, color: '#AA151B' }, { id: 'es_2', name: 'Dani Carvajal', pos: 'DEF', number: 2, color: '#AA151B' }, { id: 'es_3', name: 'A. Laporte', pos: 'DEF', number: 14, color: '#AA151B' }, { id: 'es_4', name: 'R. Le Normand', pos: 'DEF', number: 3, color: '#AA151B' }, { id: 'es_5', name: 'M. Cucurella', pos: 'DEF', number: 24, color: '#AA151B' }, { id: 'es_6', name: 'Rodri', pos: 'MID', number: 16, color: '#AA151B' }, { id: 'es_7', name: 'Pedri', pos: 'MID', number: 20, color: '#AA151B' }, { id: 'es_8', name: 'Gavi', pos: 'MID', number: 9, color: '#AA151B' }, { id: 'es_9', name: 'Lamine Yamal', pos: 'FWD', number: 19, color: '#AA151B' }, { id: 'es_10', name: 'A. Morata', pos: 'FWD', number: 7, color: '#AA151B' }, { id: 'es_11', name: 'Nico Williams', pos: 'FWD', number: 17, color: '#AA151B' },
            ] },
            'Inglaterra': { flag: 'linear-gradient(45deg, #FFFFFF 70%, #CE1124 70%)', players: [
                { id: 'en_1', name: 'J. Pickford', pos: 'GK', number: 1, color: '#CE1124' }, { id: 'en_2', name: 'K. Walker', pos: 'DEF', number: 2, color: '#CE1124' }, { id: 'en_3', name: 'J. Stones', pos: 'DEF', number: 5, color: '#CE1124' }, { id: 'en_4', name: 'M. Guehi', pos: 'DEF', number: 6, color: '#CE1124' }, { id: 'en_5', name: 'B. Chilwell', pos: 'DEF', number: 3, color: '#CE1124' }, { id: 'en_6', name: 'D. Rice', pos: 'MID', number: 4, color: '#CE1124' }, { id: 'en_7', name: 'J. Bellingham', pos: 'MID', number: 10, color: '#CE1124' }, { id: 'en_8', name: 'P. Foden', pos: 'MID', number: 11, color: '#CE1124' }, { id: 'en_9', name: 'H. Kane', pos: 'FWD', number: 9, color: '#CE1124' }, { id: 'en_10', name: 'B. Saka', pos: 'FWD', number: 17, color: '#CE1124' }, { id: 'en_11', name: 'M. Rashford', pos: 'FWD', number: 19, color: '#CE1124' },
            ] },
            'Portugal': { flag: 'linear-gradient(0deg, #006600 40%, #FF0000 40%)', players: [
                { id: 'pt_1', name: 'Rui Patricio', pos: 'GK', number: 1, color: '#006600' }, { id: 'pt_2', name: 'J. Cancelo', pos: 'DEF', number: 20, color: '#006600' }, { id: 'pt_3', name: 'Ruben Dias', pos: 'DEF', number: 4, color: '#006600' }, { id: 'pt_4', name: 'A. Silva', pos: 'DEF', number: 3, color: '#006600' }, { id: 'pt_5', name: 'N. Mendes', pos: 'DEF', number: 5, color: '#006600' }, { id: 'pt_6', name: 'B. Fernandes', pos: 'MID', number: 8, color: '#006600' }, { id: 'pt_7', name: 'Vitinha', pos: 'MID', number: 23, color: '#006600' }, { id: 'pt_8', name: 'B. Silva', pos: 'MID', number: 10, color: '#006600' }, { id: 'pt_9', name: 'C. Ronaldo', pos: 'FWD', number: 7, color: '#006600' }, { id: 'pt_10', name: 'G. Ramos', pos: 'FWD', number: 26, color: '#006600' }, { id: 'pt_11', name: 'R. Leao', pos: 'FWD', number: 15, color: '#006600' },
            ] },
            'Alemania': { flag: 'linear-gradient(0deg, #000000 33%, #DD0000 33%, #DD0000 66%, #FFCE00 66%)', players: [
                { id: 'de_1', name: 'M. Neuer', pos: 'GK', number: 1, color: '#000000' }, { id: 'de_2', name: 'J. Kimmich', pos: 'DEF', number: 6, color: '#000000' }, { id: 'de_3', name: 'A. Rudiger', pos: 'DEF', number: 2, color: '#000000' }, { id: 'de_4', name: 'N. Schlotterbeck', pos: 'DEF', number: 4, color: '#000000' }, { id: 'de_5', name: 'D. Raum', pos: 'DEF', number: 3, color: '#000000' }, { id: 'de_6', name: 'T. Kroos', pos: 'MID', number: 8, color: '#000000' }, { id: 'de_7', name: 'I. Gundogan', pos: 'MID', number: 21, color: '#000000' }, { id: 'de_8', name: 'J. Musiala', pos: 'MID', number: 10, color: '#000000' }, { id: 'de_9', name: 'K. Havertz', pos: 'FWD', number: 7, color: '#000000' }, { id: 'de_10', name: 'L. Sane', pos: 'FWD', number: 19, color: '#000000' }, { id: 'de_11', name: 'F. Wirtz', pos: 'FWD', number: 17, color: '#000000' },
            ] },
            'Paises Bajos': { flag: 'linear-gradient(0deg, #AE1C28 33%, #FFFFFF 33%, #FFFFFF 66%, #21468B 66%)', players: [
                { id: 'nl_1', name: 'B. Verbruggen', pos: 'GK', number: 1, color: '#21468B' }, { id: 'nl_2', name: 'D. Dumfries', pos: 'DEF', number: 22, color: '#21468B' }, { id: 'nl_3', name: 'V. van Dijk', pos: 'DEF', number: 4, color: '#21468B' }, { id: 'nl_4', name: 'S. de Vrij', pos: 'DEF', number: 6, color: '#21468B' }, { id: 'nl_5', name: 'N. Ake', pos: 'DEF', number: 5, color: '#21468B' }, { id: 'nl_6', name: 'F. de Jong', pos: 'MID', number: 21, color: '#21468B' }, { id: 'nl_7', name: 'T. Reijnders', pos: 'MID', number: 14, color: '#21468B' }, { id: 'nl_8', name: 'X. Simons', pos: 'MID', number: 7, color: '#21468B' }, { id: 'nl_9', name: 'M. Depay', pos: 'FWD', number: 10, color: '#21468B' }, { id: 'nl_10', name: 'C. Gakpo', pos: 'FWD', number: 11, color: '#21468B' }, { id: 'nl_11', name: 'D. Malen', pos: 'FWD', number: 18, color: '#21468B' },
            ] },
            'Italia': { flag: 'linear-gradient(90deg, #009246 33%, #FFFFFF 33%, #FFFFFF 66%, #CE2B37 66%)', players: [
                { id: 'it_1', name: 'G. Donnarumma', pos: 'GK', number: 21, color: '#009246' }, { id: 'it_2', name: 'G. Di Lorenzo', pos: 'DEF', number: 2, color: '#009246' }, { id: 'it_3', name: 'A. Bastoni', pos: 'DEF', number: 23, color: '#009246' }, { id: 'it_4', name: 'A. Buongiorno', pos: 'DEF', number: 24, color: '#009246' }, { id: 'it_5', name: 'F. Dimarco', pos: 'DEF', number: 3, color: '#009246' }, { id: 'it_6', name: 'N. Barella', pos: 'MID', number: 18, color: '#009246' }, { id: 'it_7', name: 'D. Frattesi', pos: 'MID', number: 16, color: '#009246' }, { id: 'it_8', name: 'L. Pellegrini', pos: 'MID', number: 10, color: '#009246' }, { id: 'it_9', name: 'M. Retegui', pos: 'FWD', number: 9, color: '#009246' }, { id: 'it_10', name: 'F. Chiesa', pos: 'FWD', number: 14, color: '#009246' }, { id: 'it_11', name: 'G. Scamacca', pos: 'FWD', number: 11, color: '#009246' },
            ] },
            'Belgica': { flag: 'linear-gradient(0deg, #000000 33%, #FAE042 33%, #FAE042 66%, #ED2939 66%)', players: [
                { id: 'be_1', name: 'K. Casteels', pos: 'GK', number: 1, color: '#ED2939' }, { id: 'be_2', name: 'T. Castagne', pos: 'DEF', number: 21, color: '#ED2939' }, { id: 'be_3', name: 'W. Faes', pos: 'DEF', number: 5, color: '#ED2939' }, { id: 'be_4', name: 'J. Vertonghen', pos: 'DEF', number: 4, color: '#ED2939' }, { id: 'be_5', name: 'A. Theate', pos: 'DEF', number: 3, color: '#ED2939' }, { id: 'be_6', name: 'A. Onana', pos: 'MID', number: 26, color: '#ED2939' }, { id: 'be_7', name: 'Y. Tielemans', pos: 'MID', number: 8, color: '#ED2939' }, { id: 'be_8', name: 'K. De Bruyne', pos: 'MID', number: 7, color: '#ED2939' }, { id: 'be_9', name: 'R. Lukaku', pos: 'FWD', number: 9, color: '#ED2939' }, { id: 'be_10', name: 'J. Doku', pos: 'FWD', number: 22, color: '#ED2939' }, { id: 'be_11', name: 'L. Trossard', pos: 'FWD', number: 17, color: '#ED2939' },
            ] },
            'Croacia': { flag: 'linear-gradient(0deg, #FF0000 33%, #FFFFFF 33%, #FFFFFF 66%, #171796 66%)', players: [
                { id: 'hr_1', name: 'D. Livakovic', pos: 'GK', number: 1, color: '#171796' }, { id: 'hr_2', name: 'J. Stanisic', pos: 'DEF', number: 22, color: '#171796' }, { id: 'hr_3', name: 'J. Gvardiol', pos: 'DEF', number: 20, color: '#171796' }, { id: 'hr_4', name: 'J. Sutalo', pos: 'DEF', number: 24, color: '#171796' }, { id: 'hr_5', name: 'B. Sosa', pos: 'DEF', number: 19, color: '#171796' }, { id: 'hr_6', name: 'L. Modric', pos: 'MID', number: 10, color: '#171796' }, { id: 'hr_7', name: 'M. Kovacic', pos: 'MID', number: 8, color: '#171796' }, { id: 'hr_8', name: 'M. Brozovic', pos: 'MID', number: 11, color: '#171796' }, { id: 'hr_9', name: 'A. Kramaric', pos: 'FWD', number: 9, color: '#171796' }, { id: 'hr_10', name: 'A. Budimir', pos: 'FWD', number: 17, color: '#171796' }, { id: 'hr_11', name: 'I. Perisic', pos: 'FWD', number: 4, color: '#171796' },
            ] },
            'Uruguay': { flag: 'linear-gradient(0deg, #003897 20%, #FFFFFF 20%, #FFFFFF 80%, #003897 80%)', players: [
                { id: 'uy_1', name: 'S. Rochet', pos: 'GK', number: 23, color: '#003897' }, { id: 'uy_2', name: 'N. Nandez', pos: 'DEF', number: 4, color: '#003897' }, { id: 'uy_3', name: 'J. Gimenez', pos: 'DEF', number: 2, color: '#003897' }, { id: 'uy_4', name: 'R. Araujo', pos: 'DEF', number: 3, color: '#003897' }, { id: 'uy_5', name: 'M. Olivera', pos: 'DEF', number: 17, color: '#003897' }, { id: 'uy_6', name: 'M. Ugarte', pos: 'MID', number: 5, color: '#003897' }, { id: 'uy_7', name: 'F. Valverde', pos: 'MID', number: 15, color: '#003897' }, { id: 'uy_8', name: 'N. de la Cruz', pos: 'MID', number: 10, color: '#003897' }, { id: 'uy_9', name: 'D. Nunez', pos: 'FWD', number: 19, color: '#003897' }, { id: 'uy_10', name: 'M. Araujo', pos: 'FWD', number: 8, color: '#003897' }, { id: 'uy_11', name: 'F. Pellistri', pos: 'FWD', number: 11, color: '#003897' },
            ] },
            'Estados Unidos': { flag: 'linear-gradient(180deg, #B22234 25%, #FFFFFF 25%, #FFFFFF 50%, #B22234 50%, #B22234 75%, #FFFFFF 75%)', players: [
                { id: 'us_1', name: 'M. Turner', pos: 'GK', number: 1, color: '#B22234' }, { id: 'us_2', name: 'S. Dest', pos: 'DEF', number: 2, color: '#B22234' }, { id: 'us_3', name: 'C. Richards', pos: 'DEF', number: 3, color: '#B22234' }, { id: 'us_4', name: 'T. Robinson', pos: 'DEF', number: 5, color: '#B22234' }, { id: 'us_5', name: 'A. Scally', pos: 'DEF', number: 14, color: '#B22234' }, { id: 'us_6', name: 'T. Adams', pos: 'MID', number: 4, color: '#B22234' }, { id: 'us_7', name: 'W. McKennie', pos: 'MID', number: 8, color: '#B22234' }, { id: 'us_8', name: 'G. Reyna', pos: 'MID', number: 7, color: '#B22234' }, { id: 'us_9', name: 'F. Sargent', pos: 'FWD', number: 24, color: '#B22234' }, { id: 'us_10', name: 'C. Pulisic', pos: 'FWD', number: 10, color: '#B22234' }, { id: 'us_11', name: 'T. Weah', pos: 'FWD', number: 21, color: '#B22234' },
            ] },
            'Mexico': { flag: 'linear-gradient(0deg, #006847 33%, #FFFFFF 33%, #FFFFFF 66%, #CE1126 66%)', players: [
                { id: 'mx_1', name: 'G. Ochoa', pos: 'GK', number: 1, color: '#006847' }, { id: 'mx_2', name: 'J. Sanchez', pos: 'DEF', number: 3, color: '#006847' }, { id: 'mx_3', name: 'C. Salcedo', pos: 'DEF', number: 15, color: '#006847' }, { id: 'mx_4', name: 'J. Gallardo', pos: 'DEF', number: 23, color: '#006847' }, { id: 'mx_5', name: 'C. Caceda', pos: 'DEF', number: 5, color: '#006847' }, { id: 'mx_6', name: 'E. Alvarez', pos: 'MID', number: 4, color: '#006847' }, { id: 'mx_7', name: 'L. Chavez', pos: 'MID', number: 8, color: '#006847' }, { id: 'mx_8', name: 'O. Govea', pos: 'MID', number: 19, color: '#006847' }, { id: 'mx_9', name: 'S. Gimenez', pos: 'FWD', number: 9, color: '#006847' }, { id: 'mx_10', name: 'H. Lozano', pos: 'FWD', number: 22, color: '#006847' }, { id: 'mx_11', name: 'A. Vega', pos: 'FWD', number: 17, color: '#006847' },
            ] },
            'Canada': { flag: 'linear-gradient(90deg, #FF0000 25%, #FFFFFF 25%, #FFFFFF 75%, #FF0000 75%)', players: [
                { id: 'ca_1', name: 'M. Crepeau', pos: 'GK', number: 1, color: '#FF0000' }, { id: 'ca_2', name: 'A. Johnston', pos: 'DEF', number: 2, color: '#FF0000' }, { id: 'ca_3', name: 'K. Miller', pos: 'DEF', number: 4, color: '#FF0000' }, { id: 'ca_4', name: 'M. Cornelius', pos: 'DEF', number: 5, color: '#FF0000' }, { id: 'ca_5', name: 'A. Davies', pos: 'DEF', number: 19, color: '#FF0000' }, { id: 'ca_6', name: 'S. Eustaquio', pos: 'MID', number: 7, color: '#FF0000' }, { id: 'ca_7', name: 'J. Osorio', pos: 'MID', number: 21, color: '#FF0000' }, { id: 'ca_8', name: 'T. Buchanan', pos: 'MID', number: 11, color: '#FF0000' }, { id: 'ca_9', name: 'J. David', pos: 'FWD', number: 20, color: '#FF0000' }, { id: 'ca_10', name: 'C. Larin', pos: 'FWD', number: 17, color: '#FF0000' }, { id: 'ca_11', name: 'T. Laryea', pos: 'FWD', number: 22, color: '#FF0000' },
            ] },
            'Colombia': { flag: 'linear-gradient(0deg, #FCD116 50%, #003893 50%)', players: [
                { id: 'co_1', name: 'C. Vargas', pos: 'GK', number: 1, color: '#FCD116' }, { id: 'co_2', name: 'D. Munoz', pos: 'DEF', number: 4, color: '#FCD116' }, { id: 'co_3', name: 'D. Sanchez', pos: 'DEF', number: 23, color: '#FCD116' }, { id: 'co_4', name: 'J. Mosquera', pos: 'DEF', number: 2, color: '#FCD116' }, { id: 'co_5', name: 'J. Lucumi', pos: 'DEF', number: 3, color: '#FCD116' }, { id: 'co_6', name: 'J. Lerma', pos: 'MID', number: 16, color: '#FCD116' }, { id: 'co_7', name: 'R. Rios', pos: 'MID', number: 8, color: '#FCD116' }, { id: 'co_8', name: 'J. Rodriguez', pos: 'MID', number: 10, color: '#FCD116' }, { id: 'co_9', name: 'L. Diaz', pos: 'FWD', number: 7, color: '#FCD116' }, { id: 'co_10', name: 'R. Falcao', pos: 'FWD', number: 9, color: '#FCD116' }, { id: 'co_11', name: 'L. Sinisterra', pos: 'FWD', number: 19, color: '#FCD116' },
            ] },
        },
    };
}(window));
