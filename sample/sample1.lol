OBTW
This is a sample program in lolcode that computes for the age in years or months.
TLDR

HAI 1.2
  I HAS A choice

  VISIBLE "1. Age in years"
  VISIBLE "2. Age in months"
  VISIBLE "3. Exit"
  VISIBLE "What do you want to do? "
  GIMMEH choice

  OBTW
    line below is not required
    it is only done here since original lolcode specs
      specify that inputs are always YARN
    for your project however, input is implicitly typecasted
      to NUMBR or NUMBAR if possible.
    you may comment the line below if you will use this program
      for your project
  
  choice R MAEK choice A NUMBR
TLDR
 	
  I HAS A year

  IT R choice   BTW IT = choice
  
  BTW choice!=1 && choice!=2 && choice!=3
  ALL OF DIFFRINT choice AN 1 AN DIFFRINT choice AN 2 AN DIFFRINT choice AN 3

KTHXBYE
