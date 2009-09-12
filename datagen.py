#!/usr/bin/env python

N = 50000

data = [dict(name='%(x)dname name%(x)d' % {'x':x}, id='%d'%x, tabs=[bool(x%3) and 'hasapp' or 'nonapp']) for x in xrange(N)]
print 'var fs_data = %s;\n' % data

