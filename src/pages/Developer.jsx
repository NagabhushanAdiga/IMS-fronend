import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Grid,
  Chip,
} from '@mui/material'
import {
  LinkedIn as LinkedInIcon,
  Language as WebIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  School as SchoolIcon,
} from '@mui/icons-material'

export default function Developer() {
  const developer = {
    name: 'Nagabhushan Adiga',
    role: 'UI Developer',
    experience: '6 years',
    specialization: 'ReactJS',
    company: 'Clinisys',
    location: 'Bengaluru, Karnataka, India',
    education: 'Shree Devi Institute of Technology, Mangalore',
    phone: '+91 7899087516',
    email: 'nagbhushan.adiga@gmail.com',
    linkedin: 'https://www.linkedin.com/in/nagabhushan-adiga-36a564151/',
    portfolio: 'https://nagabhushanadiga.github.io/nagabhushanadiga/',
    // Add your profile image URL here (e.g., from LinkedIn, GitHub, or any image hosting service)
    photoUrl: '', // Leave empty to show initials, or add image URL
    bio: 'UI Developer with 6 years of experience specializing in ReactJS and modern web technologies. Currently working at Clinisys, building intuitive and responsive user interfaces.',
    skills: ['ReactJS', 'JavaScript', 'HTML5', 'CSS3', 'Material-UI', 'React Native', 'Redux', 'Git', 'Bootstrap', 'React Hooks', 'Webpack'],
  }

  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%)',
  ]

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          background: gradients[0],
          color: 'white',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
          }
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              src={developer.photoUrl}
              alt={developer.name}
              sx={{
                width: { xs: 80, md: 120 },
                height: { xs: 80, md: 120 },
                border: '4px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                fontSize: '3rem',
                fontWeight: 'bold',
                background: developer.photoUrl ? 'transparent' : 'rgba(255, 255, 255, 0.2)',
              }}
            >
              {!developer.photoUrl && 'NA'}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '1.5rem', md: '2rem' } }}>
              {developer.name}
            </Typography>
            <Typography variant="h6" sx={{ mb: 1, opacity: 0.95, fontSize: { xs: '1rem', md: '1.25rem' } }}>
              {developer.role}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip
                label={`${developer.experience} experience`}
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white', fontWeight: 600 }}
                size="small"
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<LinkedInIcon />}
                href={developer.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.35)',
                  }
                }}
              >
                LinkedIn Profile
              </Button>
              <Button
                variant="outlined"
                startIcon={<WebIcon />}
                href={developer.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  color: 'white',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Portfolio
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* About Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              About
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
              {developer.bio}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              Passionate about creating beautiful, intuitive user interfaces and delivering exceptional user experiences.
              Specialized in building modern, responsive web applications using cutting-edge technologies.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Details
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <LocationIcon sx={{ color: 'primary.main', mt: 0.2 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                    Location
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {developer.location}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <WorkIcon sx={{ color: 'primary.main', mt: 0.2 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                    Current role
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {developer.role} at {developer.company}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <SchoolIcon sx={{ color: 'primary.main', mt: 0.2 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                    Education
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {developer.education}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <PhoneIcon sx={{ color: 'primary.main', mt: 0.2 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                    Phone
                  </Typography>
                  <Typography
                    variant="body2"
                    component="a"
                    href={`tel:${developer.phone}`}
                    sx={{
                      fontWeight: 600,
                      textDecoration: 'none',
                      color: 'inherit',
                      '&:hover': {
                        color: 'primary.main',
                        textDecoration: 'underline',
                      }
                    }}
                  >
                    {developer.phone}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <EmailIcon sx={{ color: 'primary.main', mt: 0.2 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                    Email
                  </Typography>
                  <Typography
                    variant="body2"
                    component="a"
                    href={`mailto:${developer.email}`}
                    sx={{
                      fontWeight: 600,
                      textDecoration: 'none',
                      color: 'inherit',
                      wordBreak: 'break-all',
                      '&:hover': {
                        color: 'primary.main',
                        textDecoration: 'underline',
                      }
                    }}
                  >
                    {developer.email}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Skills Section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Technical Skills
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {developer.skills.map((skill, index) => (
            <Chip
              key={skill}
              label={skill}
              sx={{
                background: gradients[index % gradients.length],
                color: 'white',
                fontWeight: 600,
                fontSize: '0.85rem',
                py: 2.5,
                px: 1,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </Box>
      </Paper>

      {/* Contact Card */}
      <Paper
        sx={{
          p: 4,
          mt: 4,
          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
          color: 'white',
          textAlign: 'center',
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
          Let's Connect!
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, opacity: 0.95 }}>
          Feel free to reach out for collaborations, opportunities, or just a friendly chat about technology.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<LinkedInIcon />}
            href={developer.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.35)',
              }
            }}
          >
            LinkedIn
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<WebIcon />}
            href={developer.portfolio}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.5)',
              color: 'white',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            Portfolio
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<EmailIcon />}
            href={`mailto:${developer.email}`}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.5)',
              color: 'white',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            Email
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<PhoneIcon />}
            href={`tel:${developer.phone}`}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.5)',
              color: 'white',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            Call
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}

