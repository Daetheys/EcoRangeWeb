from z3 import *
import numpy as np
import json

print({'a':5,'b':7})

def generate_range(jump_size_max=range(40,50),jump_size_min=range(20,30),regularity=range(2,4),sum_val=2500,chokerange=2):

    s = Solver()

    #Define vars
    minR = [Int('minR'+str(i)) for i in range(30)]
    maxR = [Int('maxR'+str(i)) for i in range(30)]

    #maxR > minR and (maxR-minR+1)%20 == 0
    for i in range(len(minR)):
        v = []
        for k in range(1,5):
            v.append(maxR[i] == minR[i] + k*20 - 1)
        s.add(Or(*v))

    #Str Positive
    for e in minR:
        s.add(e>0)
    for e in maxR:
        s.add(e>0)

    #Irregularity
    for k in range(len(minR)-2):
        s.add(minR[k+1]-minR[k] != minR[k+2]-minR[k+1])

    #Chokepoints
    chokepoints = [Int('point'+str(i)) for i in range(9) if i!=4]

    def no_other_chokepoint(c,k):
        other_chokepoints = [e for i,e in enumerate(chokepoints) if i != c]
        no_other_chokepoint = [Not(e==k) for e in other_chokepoints]
        return no_other_chokepoint

    def chokepoint_effect(c):
        i = (c+(c>=4))//3-1
        j = (c+(c>=4))%3-1
        v_its = []
        for k in range(len(minR)-1):
            #Max dynamics
            v1 = True
            v1bb = minR[k+1]-minR[k]
            v1b = And(v1bb<int(np.random.choice(regularity)),v1bb>-int(np.random.choice(regularity)))
            if i != 0:
                v1a = (minR[k+1]-minR[k])*i
                v1 = And(int(np.random.choice(jump_size_max))>v1a,v1a>int(np.random.choice(jump_size_min)))
            else:
                v1 = v1b
            #Min dynamics
            v2 = True
            v2bb = maxR[k+1]-maxR[k]
            v2b = And(v2bb<int(np.random.choice(regularity)),v2bb>-int(np.random.choice(regularity)))
            if j != 0:
                v2a = (maxR[k+1]-maxR[k])*j
                v2 = And(int(np.random.choice(jump_size_max))>v2a,v2a>int(np.random.choice(jump_size_min)))
            else:
                v2 = v2b

            no_other_chokepoint_near_list = []
            for k2 in range(k-chokerange,k+chokerange+1):
                no_other_chokepoint_near_list += no_other_chokepoint(c,k2)
            no_other_chokepoint_near = And(*no_other_chokepoint_near_list)
            v_it = Implies((chokepoints[c] == k),And(v1,v2,no_other_chokepoint_near))
            other_chokepoints = [e for i,e in enumerate(chokepoints) if i != c]
            another_chokepoint = [e==k for e in other_chokepoints]
            v_itb = Implies((chokepoints[c] != k),Or(And(v1b,v2b),*another_chokepoint))

            v_its.append(v_it)
            v_its.append(v_itb)

        s.add(And(*v_its))

        #Chokepoints must be in a specific range
        s.add(And(chokerange<chokepoints[c],chokepoints[c]<29-chokerange))

    for c in range(len(chokepoints)):
        chokepoint_effect(c)

    #Sum fixed
    s.add(sum(maxR)==sum_val)

    #Randomizer
    indexs = np.random.choice(len(chokepoints),len(chokepoints)//4,replace=False)
    for i in range(len(indexs)-1):
        s.add(chokepoints[indexs[i]]<chokepoints[indexs[i+1]])

    res = s.check()

    if res == sat:
        sol = s.model()

        miniR = [sol[i].as_long() for i in minR]
        maxiR = [sol[i].as_long() for i in maxR]

        points = {}
        for c in chokepoints:
            points[str(c)] = sol[c].as_long()

        return {"min":miniR,"max":maxiR,"points":points}
    print('unsat')
    return {"min":None,"max":None,"points":None}

<<<<<<< HEAD
#print(json.dumps(generate_range()))

=======

if __name__ == '__main__':
    import json
    sols = {}
    for i in range(100):
        print(i)
        out = generate_range()

        sols[str(i)] = out
    with open('ranges.json','w') as f:
        json.dump(sols,f)

    import matplotlib.pyplot as plt

    for i in range(25):

        miniR,maxiR,points = sols[str(i)]['min'],sols[str(i)]['max'],sols[str(i)]['points']
        if miniR:
            plt.subplot(5,5,i+1)
            print(miniR)
            plt.plot(range(30),miniR,label='minR',marker='.')
            plt.plot(range(30),maxiR,label='maxR',marker='.')
    plt.legend()

    plt.show()
    

>>>>>>> 2f7d890ae8ae1f9349bdcbd9636c6ac2a64088f5
if __name__ == '__main__' and False:
    import matplotlib.pyplot as plt
    sols = []
    for i in range(25):
        print(i)

        miniR,maxiR,points = get_new_sol()
        print(miniR,maxiR)
        print(sum(maxiR))
        print(sum(miniR))
        print(points)
        if miniR:
            plt.subplot(5,5,i+1)
            plt.plot(range(30),miniR,label='minR',marker='.')
            plt.plot(range(30),maxiR,label='maxR',marker='.')
    plt.legend()

    plt.show()